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

  // Class to create tables that dynamically add their data to the DOM
  // All data should be provided up front via a template
  // Extract the html for the rows from the table and put in into a template
  // Wrap the original table in a div with overflow
  // And provide the ids of the table, the template and the number of elements to be in the dom

  // Optimisations:
  //  - Preprocess all string data for filtering, i.e. when loading data in set to uppercase, strip whitespace etc.
  //  - Only check filter columns that have changed
  //  - If adding filter, only need to loop over already filtered rows
  //  - Could handle filtering with binary values, each column has a certain power of 2, when filtering
  //    increase the filter value for that row by this power of 2, only add rows where this value is 0 i.e. unfiltered



  constructor(tableID, rowDataTableTemplateID, numberOfElementsToRender) {
    console.log("Creating Virtualised Table");
    
    this.table = document.getElementById(tableID);
    this.template = document.getElementById(rowDataTableTemplateID);
    this.numberOfElementsToRender = numberOfElementsToRender;
    this.tableBody = this.table.getElementsByTagName("tbody")[0];

    var clone = this.template.content.cloneNode(true);
    this.tableRowData = clone.children[0].rows;
    
    this.rowHeight = 0; // Will get set to proper height by initialise
    this.scrollTop = 0;
    this.rowIndex = 0;

    // These control the space above and below the "rendered" elements
    this.scrollUpControllerRow = document.createElement("tr");
    this.scrollDownControllerRow = document.createElement("tr");

    // Set up array for column filters
    this.filterValues = Array.apply(null, Array(this.table.getElementsByTagName("th").length)).map(function () {});
    
    // Get column types
    this.columnTypes = this._getColumnTypes();
    this.parsedRowData = this._getRowData();
    this.filteredRows = [...this.parsedRowData];
    
    this.initialise();
    console.log("Initialised");

    // Scroll event listener
    this.table.parentElement.onscroll = (event) => {
      console.log(`Scrolled: ${this.table.parentElement.scrollTop - this.scrollTop}px`);
      this.scrollTop = this.table.parentElement.scrollTop;
      var newRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      if (newRowIndex != this.rowIndex) {
        this.updateRows(newRowIndex);
        this.rowIndex = newRowIndex;
      }
    }
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

    // Set up parse function lookup
    var columnTypeParseFunctionLookup = new Map()
    columnTypeParseFunctionLookup.set("INTEGER", parseInt);
    columnTypeParseFunctionLookup.set("DATE", Date.parse);

    // For each row, loop over columns and parse data with function if provided, else add data as is
    for (var i = 0; i < this.tableRowData.length; i++) {
      var currentRowData = [this.tableRowData[i]];
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

  getLowestAndGreatestIndexToRender(rowIndex) {
    var newLowestIndexToRender = Math.max(rowIndex - 5, 0);
    var newGreatestIndexToRender = Math.min(newLowestIndexToRender + this.numberOfElementsToRender - 1, this.filteredRows.length - 1);
    newLowestIndexToRender = Math.max(Math.min(newLowestIndexToRender, newGreatestIndexToRender - this.numberOfElementsToRender + 1), 0);

    return {"lowestIndexToRender" : newLowestIndexToRender, "greatestIndexToRender" : newGreatestIndexToRender};
  }

  initialise() {
    var { lowestIndexToRender, greatestIndexToRender } = this.getLowestAndGreatestIndexToRender(this.rowIndex);

    // Add top controller row
    this.tableBody.append(this.scrollUpControllerRow);
    this.scrollUpControllerRow.style.height = "0px";
    
    // Add initial rows, these will get replaced by updateRows
    for (i = lowestIndexToRender; i <= greatestIndexToRender; i++) {
      this.tableBody.append(this.filteredRows[i][0].cloneNode(true));
    }
    // Get row height, will mess up if no data available
    this.rowHeight = this.tableBody.children[1].getBoundingClientRect()["height"];
    console.log(`Row height: ${this.rowHeight}`);
    
    // Add bottom controller row
    this.tableBody.append(this.scrollDownControllerRow);
    var heightOfMissingRows = (this.tableRowData.length - (greatestIndexToRender - lowestIndexToRender)) * this.rowHeight;
    this.scrollDownControllerRow.style.height = `${heightOfMissingRows}px`;

    // Read in any filter values, then filter and update rows
    this.setInitialFilterValues();
    this.filterRows();
    this.updateRows(this.rowIndex);
  }

  updateRows(newRowIndex) {
    console.log(`New row index: ${newRowIndex}`);
    
    var { lowestIndexToRender : newLowestIndexToRender, greatestIndexToRender : newGreatestIndexToRender } = this.getLowestAndGreatestIndexToRender(newRowIndex);
    console.log(`New lowest index to render: ${newLowestIndexToRender}`);
    console.log(`New greatest index to render: ${newGreatestIndexToRender}`);
    
    // Replace the children with cloned nodes from the filtered row data
    for (i = 1; i < this.tableBody.children.length - 1; i++) {
      var idx = newLowestIndexToRender + i - 1;
      this.tableBody.replaceChild(this.filteredRows[idx][0].cloneNode(true), this.tableBody.children[i]);
    }

    var numRowsMissingAbove = newLowestIndexToRender;
    var numRowsMissingBelow = this.filteredRows.length - newGreatestIndexToRender - 1;

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
    
    this.multiDimensionalSort(this.filteredRows, sortOrder);
    this.updateRows(this.rowIndex);
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

  updateFilterValues(callingElement) {
    // Declare variables
    var input, filter,columnIndex;
    columnIndex = parseInt(callingElement.parentElement.dataset.columnIndex);
    input = callingElement.value;
    filter = input.toUpperCase();
    this.filterValues[columnIndex] = filter;
    console.log(`filter: ${filter}, columnIndex: ${columnIndex}`);
    this.filterRows();
  }

  filterRows() {
    var i, j, columnIndex, shouldAdd;
    var filteredRows = [];
    var columnsToCheck = [];

    // Get filter values and add them to array, alongside their column index
    for (i = 0; i < this.filterValues.length; i++) {
      var value = this.filterValues[i]
      if (value == undefined) {
        continue;
      }
      columnsToCheck.push([value, i]);
    }
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < this.parsedRowData.length; i++) {

      shouldAdd = true;

      // Check all columns that have filter values
      for (j = 0; j < columnsToCheck.length; j++) {
        var [filterValue, columnIndex] = columnsToCheck[j];

        value = this.parsedRowData[i][columnIndex + 1];

        if (value.toString().toUpperCase().indexOf(filterValue) == -1) {
          shouldAdd = false;
          break;
        }
      }

      if (shouldAdd) {
        filteredRows.push(this.parsedRowData[i]);
      }

    }

    this.filteredRows = filteredRows;
    this.updateNumberOfRowsRendered();
    this.updateRows(this.rowIndex);

  }

  setInitialFilterValues() {
    var filterInputs = this.table.getElementsByTagName("thead")[0].getElementsByTagName("input");
    for (i = 0; i < filterInputs.length; i++) {
      var filterValue = filterInputs[i].value.toUpperCase();
      var columnIndex = parseInt(filterInputs[i].parentElement.dataset.columnIndex);
      this.filterValues[columnIndex] = filterValue;
    }
  }

  updateNumberOfRowsRendered() {
    var numberOfRowsOnTable = this.tableBody.children.length - 2;
    if (numberOfRowsOnTable > this.filteredRows.length) {
      // Sub 2 to account for scrollDownControllerRow, remove children in reverse
      for (var i = this.tableBody.children.length - 2; i > this.filteredRows.length; i--) {
        this.tableBody.removeChild(this.tableBody.children[i]);
      }
    } else if (numberOfRowsOnTable < this.numberOfElementsToRender) {
      var maxVisibleElements = Math.min(this.numberOfElementsToRender, this.filteredRows.length);
      for (var i = 0; i < maxVisibleElements - numberOfRowsOnTable; i++) {
        this.tableBody.insertBefore(this.filteredRows[0][0].cloneNode(true), this.scrollDownControllerRow);
      }
    }
  }

}