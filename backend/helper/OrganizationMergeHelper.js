const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

// Columns across the database that hold a reference to Organization.Id.
// Discovery is schema driven rather than model driven so a table cannot be
// missed just because its Sequelize association is commented out.
//
// NOTE: OrganizationTypeId is deliberately NOT here - it points at
// vwOrganizationType, not at Organization.
const ORG_REFERENCE_COLUMNS = [
  'OrganizationId',
  'organization_id',
  'ParentOrganizationId',
  'FromOrganizationId',
  'ToOrganizationId',
];

class OrganizationMergeHelper {
  // Every base table (views are excluded - they are derived) that carries one
  // of the reference columns above.
  GetReferenceColumns = async () => {
    const Placeholders = ORG_REFERENCE_COLUMNS.map((_, i) => `:col${i}`).join(', ');
    const Replacements = {};
    ORG_REFERENCE_COLUMNS.forEach((Name, i) => {
      Replacements[`col${i}`] = Name;
    });

    const Rows = await sequelize.query(
      `SELECT c.TABLE_SCHEMA, c.TABLE_NAME, c.COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS c
         JOIN INFORMATION_SCHEMA.TABLES t
           ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
          AND t.TABLE_NAME = c.TABLE_NAME
        WHERE t.TABLE_TYPE = 'BASE TABLE'
          AND c.COLUMN_NAME IN (${Placeholders})
        ORDER BY c.TABLE_NAME, c.COLUMN_NAME`,
      { type: Sequelize.QueryTypes.SELECT, replacements: Replacements }
    );

    return Rows.map((Row) => ({
      Schema: Row.TABLE_SCHEMA,
      Table: Row.TABLE_NAME,
      Column: Row.COLUMN_NAME,
    }));
  };

  // How many rows each table would move. Used by the confirmation dialog so
  // the operator sees the blast radius before committing.
  GetMergePreview = async (SourceId, TargetId) => {
    const Columns = await this.GetReferenceColumns();
    const Items = [];
    let Total = 0;

    for (const Ref of Columns) {
      const [Row] = await sequelize.query(
        `SELECT COUNT(*) AS Cnt FROM [${Ref.Schema}].[${Ref.Table}] WHERE [${Ref.Column}] = :SourceId`,
        { type: Sequelize.QueryTypes.SELECT, replacements: { SourceId } }
      );
      const Count = Row && Row.Cnt ? parseInt(Row.Cnt, 10) : 0;
      if (Count > 0) {
        Items.push({ Table: Ref.Table, Column: Ref.Column, Count });
        Total += Count;
      }
    }

    return { Items, Total, TargetId };
  };

  // Repoint every reference from SourceId to TargetId, then deactivate the
  // source. Runs as one transaction - either all of it lands or none of it.
  MergeOrganizations = async ({ SourceId, TargetId, LogedUserId }) => {
    const Columns = await this.GetReferenceColumns();
    const Moved = [];
    let Total = 0;

    await sequelize.transaction(async (t) => {
      for (const Ref of Columns) {
        // Count inside the transaction rather than trusting the driver's
        // affected-row metadata, which is not consistent across dialects.
        const [Row] = await sequelize.query(
          `SELECT COUNT(*) AS Cnt FROM [${Ref.Schema}].[${Ref.Table}] WHERE [${Ref.Column}] = :SourceId`,
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { SourceId },
            transaction: t,
          }
        );
        const Count = Row && Row.Cnt ? parseInt(Row.Cnt, 10) : 0;
        if (Count === 0) continue;

        // The source row itself keeps its identity; only references move.
        await sequelize.query(
          `UPDATE [${Ref.Schema}].[${Ref.Table}]
              SET [${Ref.Column}] = :TargetId
            WHERE [${Ref.Column}] = :SourceId`,
          { replacements: { SourceId, TargetId }, transaction: t }
        );

        Moved.push({ Table: Ref.Table, Column: Ref.Column, Count });
        Total += Count;
      }

      // If the target used to hang off the source it is now its own parent.
      await sequelize.query(
        `UPDATE [Organization]
            SET [ParentOrganizationId] = NULL
          WHERE [Id] = :TargetId AND [ParentOrganizationId] = :TargetId`,
        { replacements: { TargetId }, transaction: t }
      );

      // Deactivate the source and record where its data went.
      await sequelize.query(
        `UPDATE [Organization]
            SET [IsActive] = 0,
                [MergedIntoId] = :TargetId,
                [MergedDate] = GETDATE(),
                [MergedUserId] = :LogedUserId
          WHERE [Id] = :SourceId`,
        {
          replacements: { SourceId, TargetId, LogedUserId: LogedUserId || null },
          transaction: t,
        }
      );
    });

    return { Moved, Total };
  };
}

module.exports = new OrganizationMergeHelper();
