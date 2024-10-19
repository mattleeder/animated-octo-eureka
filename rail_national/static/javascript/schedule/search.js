function myFunction(callingElement) {
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
    this.table = document.getElementById(tableID);
    this.tableBody = this.table.getElementsByTagName("tbody")[0];
  }

  getRowData() {
  }

  addRows(startIdx, endIdx) {
    for (i = startIdx; i < endIdx; i++) {
      this.tableBody.appendChild(this.tableRowData[i]);
    }
  }

}