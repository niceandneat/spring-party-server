export default class QuaryHandler {

  static selectQuery(connnectionData, queryData, callback) {

    // make query statement
    let queryText = "SELECT * FROM " + queryData.table;
    if (queryData.condition) queryText += " WHERE " + queryData.condition;
    
    // conduct query statement
    connnectionData.db.query(queryText, (error, results, fields) => {
      if (error) throw error;
      if (typeof callback === "function") callback(results, connnectionData);
    });
  
  }
  
  static insertQuery(connnectionData, queryData, callback) {
  
    // make query statement
    let queryText = "INSERT INTO " + queryData.table + " SET ?";
  
    // conduct query statement
    connnectionData.db.query(queryText, queryData.contents, (error, results, fields) => {
      if (error) throw error;
      if (typeof callback === "function") callback(results, connnectionData);
    });
  
  }
  
  static updateQuery(connnectionData, queryData, callback) {
  
    // make query statement
    let queryText = "UPDATE " + queryData.table + " SET ? WHERE " + queryData.condition;
  
    // conduct query statement
    connnectionData.db.query(queryText, queryData.contents, (error, results, fields) => {
      if (error) throw error;
      if (typeof callback === "function") callback(results, connnectionData);
    });
  
  }

}