import i18n from "i18n";
import * as dataSource from "utils/rest/dataSourceHelper";
import Server, { call } from "config/Server";

export const dataSourceHelper = dataSource;

export const list = async ({ objectName, select, options, service, url }) => {
  let req = url ? url : `${service ? `/${service}` : ""}/base/${objectName}`;
  req += dataSource.getQuery({ select, options });
  return await call({ url: req, method: "GET" });
};

export const lookup = async ({
  objectName,
  service,
  select,
  options,
  url,
  dontUseDefaultTake,
}) => {
  let req = url
    ? url
    : `${service ? `/${service}` : ""}/base/${objectName}/lookup`;
  if (!dontUseDefaultTake) {
    if (!options.take) {
      options.take = 400;
      options.skip = 0;
    }
  }
  req += dataSource.getQuery({ select, options });
  return await call({ url: req, method: "GET" });
};

export const one = async ({ id, url, objectName, select, service }) => {
  let req = url
    ? url
    : `${service ? `/${service}` : ""}/base/${objectName}/${id}`;
  req += dataSource.getQuery({ select });
  return await call({ url: req, method: "GET" });
};

export const getCustomDataSource = dataSource.getCustomDataSource;
export const getArrayDataSource = dataSource.getArrayDataSource;

export const getListDataStore = ({ select, objectName, key, load }) => {
  return getCustomDataSource({
    key,
    load: async (options) => await list({ objectName, select, options }),
  });
};

export const getLookupDataStore = ({
  url,
  select,
  objectName,
  service,
  key,
  load,
  dontUseDefaultTake,
  rootFilter,
}) => {
  return getCustomDataSource({
    key,
    load: load
      ? load
      : async (options) => {
          if (rootFilter) {
            options.filter = options.filter
              ? [rootFilter, "and", options.filter]
              : rootFilter;
          }

          const responseData = await lookup({
            url,
            service,
            objectName,
            select,
            options,
            dontUseDefaultTake,
          });

          if (responseData.success) {
            return {
              data: responseData.data.rows,
              totalCount: responseData.data.count,
            };
          }
          return { data: [], totalCount: 0 };
        },
    byKey: load
      ? async (id) => {
          const { data, totalCount } = await load({ filter: [key, "=", id] });
          return data && data.length > 0 ? data[0] : null;
        }
      : async (id) => {
          try {
            const data = await one({ objectName, url, service, select, id });
            if (data && data.success && data.data) {
              return data.data;
            }
            return null;
          } catch (error) {
            console.warn(
              `Failed to load ${objectName} with id ${id}:`,
              error.message,
            );
            return null;
          }
        },
  });
};
