class VirtualisedTable {
    constructor(tableID, rowDataAsJSON, columnTypesAsJSON, headerNames, columnOrder, numberOfElementsToRender) {
      console.log("Creating Virtualised Table");
      this.tableID = tableID;
      this.rowDataAsJSON = rowDataAsJSON;
      this.columnTypesAsJSON = columnTypesAsJSON;
      this.headerNames = headerNames;
      this.columnOrder = columnOrder;
      this.numberOfElementsToRender = numberOfElementsToRender;
      this.sizeOfVirtualisedList = rowDataAsJSON.length;
      this.table = document.getElementById(tableID);
      this.tableBody = document.createElement("tbody");
      this.table.appendChild(this.tableBody);
    }

    addRows() {
      var tableRow = document.createElement("tr");
      for (var key in this.rowDataAsJSON[0]) {
        var value = this.rowDataAsJSON[0][key];
        var td = document.createElement("td");
        td.innerHTML = value;
        tableRow.appendChild(td);
      }
      this.tableBody.appendChild(tableRow);
    }
  
  
  }