import i18n from "i18n";
import Helper from "helper";

/**
 * Shared helper functions for form operations
 * Used by both BaseCustomForm (class) and useBaseForm (hook)
 */

/**
 * Loads form configuration from the server
 * @param {string} ObjectName - The name of the object/entity
 * @param {Function} callback - Callback function (resData) => void
 * @param {Function} onError - Optional error callback
 * @returns {Promise<void>}
 */
export const loadFormConfig = async (ObjectName, callback, onError) => {
  if (!ObjectName) {
    onError && onError("ObjectName is required");
    return;
  }

  try {
    await Helper.BaseCrudHelper.GetConfigData(ObjectName, (resData) => {
      if (resData && resData.Data) {
        callback(resData.Data);
      } else {
        process.env.NODE_ENV === "development" &&
          console.warn("No config data received for:", ObjectName);
        onError && onError("No config data received");
      }
    });
  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.error("Error loading form config:", error);
    onError && onError(error);
  }
};

/**
 * Loads detail data for editing
 * @param {Object} params - Parameters
 * @param {string} params.ObjectName - The name of the object/entity
 * @param {string} params.PrimaryKey - The primary key field name
 * @param {string|number} params.DataId - The ID of the data to load
 * @param {Function} callback - Callback function (data) => void
 * @param {Function} onError - Optional error callback
 * @returns {Promise<void>}
 */
export const loadDetailData = async (
  { ObjectName, PrimaryKey, DataId },
  callback,
  onError,
) => {
  if (!ObjectName || !DataId) {
    onError && onError("ObjectName and DataId are required");
    return;
  }

  try {
    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: PrimaryKey || "id_data", Op: "Equals", Value: DataId },
    ];

    await Helper.BaseCrudHelper.BaseGetDetail(
      { ObjectName, SearchOption },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          callback(resData.Data);
        } else {
          onError && onError("Failed to load data");
        }
      },
    );
  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.error("Error loading detail data:", error);
    onError && onError(error);
  }
};

/**
 * Gets a field configuration by name
 * @param {string} fieldName - The field name
 * @param {Array} fields - The fields array
 * @returns {Object|null} - The field configuration or null
 */
export const getFieldByName = (fieldName, fields) => {
  return Helper.BaseCrudHelper.GetFieldByName(fieldName, fields);
};

/**
 * Gets a field configuration with its current value
 * @param {string} fieldName - The field name
 * @param {Array} fields - The fields array
 * @param {Object} editObject - The current edit object
 * @returns {Object|null} - The field configuration with value or null
 */
export const getFieldWithValue = (fieldName, fields, editObject) => {
  const field = getFieldByName(fieldName, fields);

  if (!field) return null;

  // Special handling for medication list sorting
  if (fieldName === "UuhEmSelect" && field.Data) {
    const sortedData = [...field.Data];
    sortedData.sort((a, b) => {
      const valA = parseInt(a.Value, 10);
      const valB = parseInt(b.Value, 10);
      if (isNaN(valA)) return 1;
      if (isNaN(valB)) return -1;
      return valA - valB;
    });
    field.Data = sortedData;
  }

  // Special handling for checkbox fields - ensure array value
  if (field.Type === "CheckBox") {
    const value =
      editObject && editObject[fieldName] ? editObject[fieldName] : [];
    field.Value = Array.isArray(value) ? value : [];
  } else {
    field.Value =
      editObject && editObject[fieldName] ? editObject[fieldName] : "";
  }
  return field;
};

/**
 * Saves form data (create or update)
 * @param {Object} params - Parameters
 * @param {string} params.ObjectName - The name of the object/entity
 * @param {Object} params.Data - The data to save
 * @param {boolean} params.IsNew - Whether this is a new record
 * @param {string} params.PrimaryKey - The primary key field name
 * @param {string|number} params.DataId - The ID (for updates)
 * @param {Function} callback - Callback function
 * @returns {Promise<void>}
 */
export const saveFormData = async (
  { ObjectName, Data, IsNew, PrimaryKey, DataId },
  callback,
) => {
  if (IsNew) {
    await Helper.BaseCrudHelper.BaseCreate({ ObjectName, Data }, callback);
  } else {
    const updateData = { ...Data, [PrimaryKey || "id_data"]: DataId };
    await Helper.BaseCrudHelper.BaseUpdate(
      { ObjectName, Data: updateData },
      callback,
    );
  }
};
