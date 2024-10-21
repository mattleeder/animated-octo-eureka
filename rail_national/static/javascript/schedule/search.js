function filterRows(callingElement) {
    // Declare variables
    console.log(callingElement);
    var input, filter, table, tr, td, i, txtValue, columnIndex;
    columnIndex = parseInt(callingElement.parentElement.dataset.columnIndex);
    input = callingElement.value;
    filter = input.toUpperCase();
    table = document.getElementsByTagName("table")[0];
    tr = table.getElementsByTagName("tr");
    console.log(`filter: ${filter}, columnIndex: ${columnIndex}`);
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[columnIndex];
      if (td) {
        txtValue = td.textContent || td.innerText;
        console.log(txtValue);
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].dataset.columnsHidingThisRow = replaceCharAtStringIndex(tr[i].dataset.columnsHidingThisRow, columnIndex, "0");
          if (tr[i].dataset.columnsHidingThisRow == "00000000") {
            tr[i].style.display = "";
          }
        } else {
          tr[i].dataset.columnsHidingThisRow = replaceCharAtStringIndex(tr[i].dataset.columnsHidingThisRow, columnIndex, "1");
          tr[i].style.display = "none";
        }
      }
    }
  }

function replaceCharAtStringIndex(string, index, replacement) {
  console.log(`String: ${string}, Index: ${index}, Replacement: ${replacement}`);
  out = string.slice(0, index) + replacement + string.slice(index + 1);
  console.log(out);
  return out;
}

function multiDimensionalSort(arrayToSort, sortOrder) {
  sortStartTime = Date.now();
  arrayToSort.sort((a, b) => {
      for (i = 0; i < sortOrder.length; i++) {
        // Add 1 to ignore row index
          //idx = sortOrder[i][0] + 1;
          idx = i + 1;
          sortDirection = sortOrder[i][1];
          if (a[idx] == b[idx]) {
              continue;
          }
          if (sortDirection == 1){
            return (a[idx] > b[idx]) - 0.5; // > 0 if true < 0 if false
          } else {
            return (a[idx] < b[idx]) - 0.5; // > 0 if false < 0 if true
          }
      }
      return 0;
  });
  sortTimeTakenMilliseconds = Date.now() - sortStartTime;
  console.log(`Sort Time Taken ${sortTimeTakenMilliseconds / 1000}s`);
  return arrayToSort;
}

function columnMultiSort(callingElement) {
  // Start timer
  functionStartTime = Date.now();

  table = document.getElementsByTagName("table")[0];
  headerRow = table.rows[0];
  columnHeaders = headerRow.getElementsByTagName("th");
  columnTypesIndexLookup = [];

  for (let i = 0; i < columnHeaders.length; i++) {
    columnTypesIndexLookup.push(columnHeaders[i].dataset.columnType);
  }

  columnTypeParseFunctionLookup = new Map()
  columnTypeParseFunctionLookup.set("INTEGER", parseInt);
  columnTypeParseFunctionLookup.set("DATE", Date.parse);

  columnIndex = parseInt(callingElement.parentElement.dataset.columnIndex);
  sortState = callingElement.dataset.sortState;
  if (sortState == "-1") {

    // Remove sort
    table.dataset.sortOrder = table.dataset.sortOrder.replace(`-${columnIndex},`, "");

    // Set state to 0
    callingElement.dataset.sortState = "0";
    callingElement.classList.replace("sort-button-down", "sort-button-both");

    // Check if sort order is empty
    if (table.dataset.sortOrder == "") {
      return;
    }

  } else if (sortState == "0") {

    // Append the column index to the sort order
    table.dataset.sortOrder += `${columnIndex},`;

    // Set state to 1
    callingElement.dataset.sortState = "1";
    callingElement.classList.replace("sort-button-both", "sort-button-up");

  } else if (sortState == "1") {

    // Reverse sort order
    table.dataset.sortOrder = table.dataset.sortOrder.replace(`${columnIndex},`, `-${columnIndex},`);

    // Set state to -1
    callingElement.dataset.sortState = "-1";
    callingElement.classList.replace("sort-button-up", "sort-button-down");

  }

  // Parse the sort order
  sortOrder = table.dataset.sortOrder.split(",").slice(0, -1);
  sortOrder = sortOrder.map((x) => {
    num = parseInt(x);
    index = Math.abs(num);
    // 1 for forwards, -1 for reverse
    sortDirection = x[0] == "-" ? -1 : 1;
    return [index, sortDirection];
  });

  // Reverse to give priority to most recent clicks
  sortOrder.reverse();

  // Add Relevant Data For Sort
  rows = table.rows;
  rowData = [];
  // Start from 1 to ignore header row
  for (i = 1; i < rows.length; i++) {
      currentRow = [];
      currentRow.push(i);
      // Add the relevant column data
      for (j = 0; j < sortOrder.length; j++) {
        columnIndex = sortOrder[j][0];
        columnParseFunction = columnTypeParseFunctionLookup.get(columnTypesIndexLookup[columnIndex]);
        if (columnParseFunction == undefined) {
          data = rows[i].getElementsByTagName("td")[columnIndex].innerHTML;
        } else {
          data = columnParseFunction(rows[i].getElementsByTagName("td")[columnIndex].innerHTML);
        }
        currentRow.push(data);
      }
      rowData.push(currentRow);
  }

  
  multiDimensionalSort(rowData, sortOrder);
  // elements = document.createDocumentFragment();
  // elements.appendChild(rows[0].cloneNode(true)); // Header
  // for (i = 0; i < rowData.length; i++) {
  //       elements.appendChild(rows[rowData[i][0]].cloneNode(true));
  //   }
  //   table.children[0].innerHTML = null;
  //   table.children[0].appendChild(elements);
  elements = [table.rows[0].outerHTML];
  for (i = 0; i < rowData.length; i++) {
        elements.push(rows[rowData[i][0]].outerHTML);
    }
  table.children[0].innerHTML = elements.join("");
  functionMillisecondsPassed = Date.now() - functionStartTime;
  console.log(`Time taken for function: ${functionMillisecondsPassed / 1000}s`);
}

function swapInnerHTML() {
  startTime = Date.now();
  table = document.getElementsByTagName("table")[0];
  var rowsCopy = [];
  for (i = 1; i < table.rows.length; i++) {
    rowsCopy.push(table.rows[i].innerHTML);
  }
  for (i = 1; i < table.rows.length; i++) {
    table.rows[i].innerHTML = rowsCopy[i];
  }
  timeTakenMilliseconds = Date.now() - startTime;
  console.log(`Time taken for swap: ${timeTakenMilliseconds / 1000}s`);
}

class VirtualisedTable {
  constructor(tableID, rowDataTableTemplateID, numberOfElementsToRender) {
    console.log("Creating Virtualised Table");
    this.tableID = tableID;
    this.rowDataTemplateID = rowDataTableTemplateID;
    this.template = document.getElementById(rowDataTableTemplateID);
    this.clone = this.template.content.cloneNode(true);
    this.tableRowData = this.clone.children[0].rows;
    this.numberOfElementsToRender = numberOfElementsToRender;
    this.sizeOfVirtualisedList = this.tableRowData.length;
    if (this.numberOfElementsToRender > this.sizeOfVirtualisedList) {
      throw new Error("Not enough elements in list!");
    }
    this.table = document.getElementById(tableID);
    this.rowHeight = 84.4;
    this.scrollTop = 0;
    this.rowIndex = 0;
    this.lowestIndexToRender = 0;
    this.greatestIndexToRender = (numberOfElementsToRender - 1);
    this.scrollUpControllerRow = document.createElement("tr");
    this.scrollDownControllerRow = document.createElement("tr");
    this.table.parentElement.onscroll = (event) => {
      console.log(`Scrolled: ${this.table.parentElement.scrollTop - this.scrollTop}px`);
      this.scrollTop = this.table.parentElement.scrollTop;
      var newRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      if (newRowIndex != this.rowIndex) {
        this.updateRowsNew(newRowIndex);
        this.rowIndex = newRowIndex;
        }
      console.log(this.scrollTop);
    }
    this.tableBody = this.table.getElementsByTagName("tbody")[0];
    this.columnTypes = this._getColumnTypes();
    this.parsedRowData = this._getRowData();
    console.log("Parsed data");
    this.initialise();
    console.log("Initialised");
  }

  _getColumnTypes() {
    var columnTypes = [];
    var headerColumns = this.table.getElementsByTagName("th");
    for (i = 0; i < headerColumns.length; i++) {
      columnTypes.push(headerColumns[i].dataset.columnType);
    }
    return columnTypes;
  }

  _getRowData() {
    var rowData = [];

    var columnTypeParseFunctionLookup = new Map()
    columnTypeParseFunctionLookup.set("INTEGER", parseInt);
    columnTypeParseFunctionLookup.set("DATE", Date.parse);

    for (var i = 0; i < this.tableRowData.length; i++) {
      currentRowData = [this.tableRowData[i]];
      var currentRow = this.tableRowData[i].getElementsByTagName("td");

      for (var j = 0; j < currentRow.length; j++) {
        var columnParseFunction = columnTypeParseFunctionLookup.get(this.columnTypes[j]);
        if (columnParseFunction == undefined) {
          currentRowData.push(currentRow[j].innerHTML);
        } else {
          currentRowData.push(columnParseFunction(currentRow[j].innerHTML));
        }
      }

      rowData.push(currentRowData);
    }

    return rowData;
  }

  updateRows(newRowIndex) {
    // Add elements to display + 5 on each side
    console.log("Updating rows");
    if (newRowIndex == this.rowIndex) {
      return;
    }
    
    var newLowestIndexToRender = Math.max(newRowIndex - 5, 0);
    var newGreatestIndexToRender = Math.min(newRowIndex + this.numberOfElementsToRender - 1, this.parsedRowData.length - 1);
    var tracker = 0;

    // Remove top rows
    console.log(`Trying to remove ${Math.max(newLowestIndexToRender - this.lowestIndexToRender, 0)} rows from top`);
    for (i = this.lowestIndexToRender; i < newLowestIndexToRender; i++) {
      if (this.tableBody.children.length <= 2) {
        break;
      }
      this.tableBody.removeChild(this.tableBody.children[1]);
      tracker += 1;
    }
    console.log(`Actually removed ${tracker}`);
    this.scrollUpControllerRow.style.height = `${parseInt(this.scrollUpControllerRow.style.height) + (tracker * this.rowHeight)}px`;
    //this.scrollUpControllerRow.style.height = `${this.scrollUpControllerRow.style.height + Math.max(newLowestIndexToRender - this.lowestIndexToRender, 0)}px`;

    tracker = 0;
    // Remove bottom rows
    console.log(`Trying to remove ${Math.max(this.greatestIndexToRender - newGreatestIndexToRender, 0)} rows from bottom`);
    for (i = this.greatestIndexToRender; i > newGreatestIndexToRender; i--) {
      if (this.tableBody.children.length <= 2) {
        break;
      }
      this.tableBody.removeChild(this.tableBody.children[this.tableBody.children.length - 2]);
      tracker += 1;
    }
    console.log(`Actually removed ${tracker}`);
    this.scrollDownControllerRow.style.height = `${parseInt(this.scrollDownControllerRow.style.height) + (tracker * this.rowHeight)}px`;
    //this.scrollDownControllerRow.style.height = `${this.scrollDownControllerRow.style.height + Math.max(this.greatestIndexToRender - newGreatestIndexToRender, 0)}px`;


    tracker = 0;
    // Add top rows
    console.log(`Trying to add ${Math.max(this.lowestIndexToRender - newLowestIndexToRender, 0)} rows to top`);
    for (i = this.lowestIndexToRender - 1; i >= newLowestIndexToRender; i-- ) {
      //this.tableBody.prepend(this.parsedRowData[i][0].cloneNode(true));
      console.log(`i is: ${i}`);
      if (i < 0 || i > this.sizeOfVirtualisedList - 1) {
        continue;
      }
      this.tableBody.insertBefore(this.parsedRowData[i][0].cloneNode(true), this.scrollUpControllerRow.nextSibling);
      tracker += 1;
    }
    console.log(`Actually added ${tracker}`);
    this.scrollUpControllerRow.style.height = `${parseInt(this.scrollUpControllerRow.style.height) - (tracker * this.rowHeight)}px`;
    //this.scrollUpControllerRow.style.height = `${this.scrollUpControllerRow.style.height - Math.max(this.lowestIndexToRender - newLowestIndexToRender, 0)}px`;


    tracker = 0;
    // Add bottom rows
    console.log(`Trying to add ${Math.max(newGreatestIndexToRender - this.greatestIndexToRender, 0)} rows to bottom`);
    for (i = this.greatestIndexToRender + 1; i <= newGreatestIndexToRender; i++) {
      //this.tableBody.append(this.parsedRowData[i][0].cloneNode(true));
      console.log(`i is: ${i}`);
      if (i < 0 || i > this.sizeOfVirtualisedList - 1) {
        continue;
      }
      this.tableBody.insertBefore(this.parsedRowData[i][0].cloneNode(true), this.scrollDownControllerRow);
      tracker += 1;
    }
    console.log(`Actually added ${tracker}`);
    this.scrollDownControllerRow.style.height = `${parseInt(this.scrollDownControllerRow.style.height) - (tracker * this.rowHeight)}px`;
    //this.scrollDownControllerRow.style.height = `${this.scrollDownControllerRow.style.height - Math.max(newGreatestIndexToRender - this.greatestIndexToRender, 0)}px`;

    if (newLowestIndexToRender <= 0) {
      this.scrollUpControllerRow.style.height = "0px";
    }

    if (newGreatestIndexToRender >= this.sizeOfVirtualisedList - 1) {
      this.scrollDownControllerRow.style.height = "0px";
    }


    this.lowestIndexToRender = newLowestIndexToRender;
    this.greatestIndexToRender = newGreatestIndexToRender;
  }

  initialise() {
    this.tableBody.append(this.scrollUpControllerRow);
    this.scrollUpControllerRow.style.height = "0px";
    for (i = this.lowestIndexToRender; i <= this.greatestIndexToRender; i++) {
      this.tableBody.append(this.parsedRowData[i][0].cloneNode(true));
    }
    this.tableBody.append(this.scrollDownControllerRow);
    var heightOfMissingRows = (this.sizeOfVirtualisedList - (this.greatestIndexToRender - this.lowestIndexToRender)) * this.rowHeight;
    this.scrollDownControllerRow.style.height = `${heightOfMissingRows}px`;
  }

  updateRowsNew(newRowIndex) {
    // Add elements to display + 5 on each side
    console.log(`New row index: ${newRowIndex}`);
    
    var newLowestIndexToRender = Math.max(newRowIndex, 0);
    var newGreatestIndexToRender = Math.min(newLowestIndexToRender + this.numberOfElementsToRender - 1, this.parsedRowData.length - 1);
    newLowestIndexToRender = Math.max(Math.min(newLowestIndexToRender, newGreatestIndexToRender - this.numberOfElementsToRender + 1), 0);

    var indexTracker = newLowestIndexToRender;
    var numRowsRemoved = 0;
    var numRowsAdded = 0;
    console.log(`New lowest index to render: ${newLowestIndexToRender}`);
    console.log(`New greatest index to render: ${newGreatestIndexToRender}`);
    
    indexTracker = 0;
    for (i = 1; i < this.tableBody.children.length - 1; i++) {
      var idx = newLowestIndexToRender + i - 1;
      console.log(`Index Tracker: ${idx}`);
      this.tableBody.replaceChild(this.parsedRowData[idx][0].cloneNode(true), this.tableBody.children[i]);
      indexTracker += 1;
      console.log(`Num loops: ${indexTracker}`);
      console.log(`Max i: ${this.tableBody.children.length - 2}`);
    }

    // for (i = 1; i < this.tableBody.children.length - 1; i++) {
    //   this.tableBody.removeChild(this.tableBody.children[i]);
    //   numRowsRemoved += 1;
    //   this.scrollUpControllerRow.style.height = `${(parseInt(this.scrollUpControllerRow.style.height) + this.rowHeight)}px`;
    // }
    // console.log(`Removed: ${numRowsRemoved} rows`);

    // for (i = newLowestIndexToRender; i <= newGreatestIndexToRender; i++) {
    //   this.tableBody.insertBefore(this.parsedRowData[i][0].cloneNode(true), this.scrollUpControllerRow.nextSibling);
    //   numRowsAdded += 1;
    // }
    // console.log(`Added: ${numRowsAdded} rows`);

    var numRowsMissingAbove = newLowestIndexToRender;
    var numRowsMissingBelow = this.sizeOfVirtualisedList - newGreatestIndexToRender - 1;

    console.log(`Num Rows Missing Above: ${numRowsMissingAbove}`);
    console.log(`Num Rows Missing Below: ${numRowsMissingBelow}`);

    this.scrollUpControllerRow.style.height = `${(numRowsMissingAbove * this.rowHeight)}px`;
    this.scrollDownControllerRow.style.height = `${(numRowsMissingBelow * this.rowHeight)}px`;
  }

  columnMultiSort(callingElement) {
    console.log("Called");
    console.log(callingElement);
    // Start timer
    var functionStartTime = Date.now();

    var table = this.table;

    var columnIndex = parseInt(callingElement.parentElement.dataset.columnIndex);
    console.log(`Column Index: ${columnIndex}`);
    var sortState = callingElement.dataset.sortState;

    if (sortState == "-1") {

      // Remove sort
      table.dataset.sortOrder = table.dataset.sortOrder.replace(`-${columnIndex},`, "");

      // Set state to 0
      callingElement.dataset.sortState = "0";
      callingElement.classList.replace("sort-button-down", "sort-button-both");

      // Check if sort order is empty
      if (table.dataset.sortOrder == "") {
        return;
      }

    } else if (sortState == "0") {

      // Append the column index to the sort order
      table.dataset.sortOrder += `${columnIndex},`;

      // Set state to 1
      callingElement.dataset.sortState = "1";
      callingElement.classList.replace("sort-button-both", "sort-button-up");

    } else if (sortState == "1") {

      // Reverse sort order
      table.dataset.sortOrder = table.dataset.sortOrder.replace(`${columnIndex},`, `-${columnIndex},`);

      // Set state to -1
      callingElement.dataset.sortState = "-1";
      callingElement.classList.replace("sort-button-up", "sort-button-down");

    }

    // Parse the sort order
    var sortOrder = table.dataset.sortOrder.split(",").slice(0, -1);
    sortOrder = sortOrder.map((x) => {
      var num = parseInt(x);
      var index = Math.abs(num) + 1; // Add 1 to avoid the row in array
      // 1 for forwards, -1 for reverse
      var sortDirection = x[0] == "-" ? -1 : 1;
      return [index, sortDirection];
    });
    console.log(`Sort order: ${sortOrder}`);

    // Reverse to give priority to most recent clicks
    sortOrder.reverse();
    
    this.multiDimensionalSort(this.parsedRowData, sortOrder);
    this.updateRowsNew(this.rowIndex);
    var functionMillisecondsPassed = Date.now() - functionStartTime;
    console.log(`Time taken for function: ${functionMillisecondsPassed / 1000}s`);
    }

  multiDimensionalSort(arrayToSort, sortOrder) {
    var sortStartTime = Date.now();
    arrayToSort.sort((a, b) => {
        for (i = 0; i < sortOrder.length; i++) {
            var idx = sortOrder[i][0];
            var sortDirection = sortOrder[i][1];
            if (a[idx] == b[idx]) {
                continue;
            }
            if (sortDirection == 1){
              return (a[idx] > b[idx]) - 0.5; // > 0 if true < 0 if false
            } else {
              return (a[idx] < b[idx]) - 0.5; // > 0 if false < 0 if true
            }
        }
        return 0;
    });
    var sortTimeTakenMilliseconds = Date.now() - sortStartTime;
    console.log(`Sort Time Taken ${sortTimeTakenMilliseconds / 1000}s`);
    return arrayToSort;
  }

}