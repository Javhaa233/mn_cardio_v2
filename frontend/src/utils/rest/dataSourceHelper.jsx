import i18n from "i18n";
// Custom data source helpers to replace devextreme data stores

export const getQuery = ({ select, options }) => {
  let {
    sort,
    searchValue,
    searchExpr,
    filter,
    take,
    skip,
    rootFilter,
    query,
    summary,
  } = options ?? {};

  if (searchExpr && searchValue) {
    filter = filter
      ? [filter, "and", [searchExpr, "contains", searchValue]]
      : [searchExpr, "contains", searchValue];
  }

  if (rootFilter) {
    filter = filter ? [rootFilter, "and", filter] : rootFilter;
  }

  const requestArr = [];
  if (select) {
    requestArr.push(`select=${JSON.stringify(select)}`);
  }
  if (filter) {
    requestArr.push(`filter=${JSON.stringify(filter)}`);
  }

  if (take !== undefined && skip !== undefined) {
    requestArr.push(`take=${Number(take)}&skip=${Number(skip)}`);
  }

  if (sort) {
    requestArr.push(`sort=${JSON.stringify(sort)}`);
  }

  if (query && Object.keys(query).length > 0) {
    for (let i = 0; i < Object.keys(query).length; i++) {
      if (query[Object.keys(query)[i]]) {
        requestArr.push(
          `${Object.keys(query)[i]}=${query[Object.keys(query)[i]]}`,
        );
      }
    }
  }

  if (summary) {
    requestArr.push(`summary=${JSON.stringify(summary)}`);
  }

  return `?${requestArr.join("&")}`;
};

// Custom store implementation to replace devextreme CustomStore
export const getCustomDataSource = ({
  key,
  load,
  byKey,
  update,
  insert,
  remove,
}) => {
  // Return an object that mimics the CustomStore interface
  return {
    key: key || "id",
    load: async (options) => {
      // The load function is passed as a parameter
      return await load(options);
    },
    insert: insert
      ? async (values) => {
          return await insert(values);
        }
      : async () => {},
    update: update
      ? async (keyValue, values) => {
          return await update(keyValue, values);
        }
      : async () => {},
    remove: remove
      ? async (keyValue) => {
          return await remove(keyValue);
        }
      : async () => {},
    byKey: byKey
      ? async (id) => {
          return await byKey(id);
        }
      : async () => {},
  };
};

export const getLookupDataStore = ({ key, load }) => {
  return getCustomDataSource({
    key,
    load: load,
    byKey: async (id) => {
      const result = await load({ filter: [key, "=", id] });
      return result && result.data && result.data.length > 0
        ? result.data[0]
        : null;
    },
  });
};

// Simple array data source for local data
export const getArrayDataSource = ({ key, data }) => {
  // Return an object that can be used to query from local array data
  return {
    items: () => data || [],
    filter: (filterFn) => {
      if (!data) return [];
      return data.filter(filterFn);
    },
    find: (predicate) => {
      if (!data) return null;
      return data.find(predicate);
    },
  };
};

export const checkFilter = ({ fieldName, arrayFilter }) => {
  let result = false;
  if (Array.isArray(arrayFilter)) {
    for (let i = 0; i < arrayFilter.length; i++) {
      if (Array.isArray(arrayFilter[0])) {
        result = checkFilter({ fieldName, arrayFilter: arrayFilter[0] });
      } else if (
        typeof arrayFilter[0] === "string" &&
        fieldName === arrayFilter[0]
      ) {
        result = true;
      }
      if (result) return result;
    }
  }

  return result;
};
