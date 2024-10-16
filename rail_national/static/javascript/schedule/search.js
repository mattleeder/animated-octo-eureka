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

function mySortFunction(callingElement) {
  // Start timer
  start = Date.now();

  table = document.getElementsByTagName("table")[0];
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

  table = document.getElementsByTagName("table")[0];
  sorting = true;

  // Loop until nothing found to sort
  while (sorting) {
    sorting = false;
    rows = table.rows;

    // Check each pair of rows
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwap = false;

      // Check each column in the sort order
      for (j = 0; j < sortOrder.length; j++) {
        columnIndex = sortOrder[j][0];
        sortDirection = sortOrder[j][1];
        first = rows[i].getElementsByTagName("td")[columnIndex];
        second = rows[i + 1].getElementsByTagName("td")[columnIndex];
        if (first.innerHTML == second.innerHTML) {
          continue;
        }
        break;
      }
      
      if (notSorted(first.innerHTML.toUpperCase(), second.innerHTML.toUpperCase(), sortDirection)) {
        shouldSwap = true;
        break;
      }
    }

    if (shouldSwap) {
      rows[i].parentElement.insertBefore(rows[i + 1], rows[i]);
      sorting = true;
    }
  }

  millisecondsPassed = Date.now() - start;
  console.log(`Time taken for sort: ${millisecondsPassed / 1000}s`);
}

function notSorted(first, second, sortDirection) {
  // If sort direction is -1 we must sort in reverse
  if (sortDirection == -1) {
    return first < second;
  }
  // Otherwise sort direction is 1 and we should sort forwards
  return first > second;
}

function sortRouteNumber() {
  start = Date.now();
  table = document.getElementsByTagName("table")[0];
  columnIndex = 0;
  rows = table.rows;
  rowData = [];
  for (i = 1; i < rows.length; i++) {
      currentRow = rows[i].getElementsByTagName("td")[columnIndex];
      rowData.push([i, parseInt(currentRow.innerHTML)]);
  }
  rowData.sort((a, b) => a[1] - b[1]);
  elements = document.createDocumentFragment();
  elements.appendChild(rows[0].cloneNode(true)); // Header
  for (i = 0; i < rowData.length; i++) {
      elements.appendChild(rows[rowData[i][0]].cloneNode(true));
  }
  table.children[0].innerHTML = null;
  table.children[0].appendChild(elements);
  millisecondsPassed = Date.now() - start;
  console.log(`Time taken for sort: ${millisecondsPassed / 1000}s`);
}

function multiDimensionalSort(arrayToSort, sortOrder) {
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
  return arrayToSort;
}

function mySortFunction2(callingElement) {
  // Start timer
  start = Date.now();

  table = document.getElementsByTagName("table")[0];
  headerRow = table.rows[0];
  columnHeaders = headerRow.getElementsByTagName("th");
  columnTypesIndexLookup = [];

  for (let i = 0; i < columnHeaders.length; i++) {
    columnTypesIndexLookup.push(columnHeaders[i].dataset.columnType);
  }

  columnTypeParseFunctionLookup = new Map()
  columnTypeParseFunctionLookup.set("INTEGER", parseInt);

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
  elements = document.createDocumentFragment();
  elements.appendChild(rows[0].cloneNode(true)); // Header
  for (i = 0; i < rowData.length; i++) {
      elements.appendChild(rows[rowData[i][0]].cloneNode(true));
  }
  table.children[0].innerHTML = null;
  table.children[0].appendChild(elements);
  millisecondsPassed = Date.now() - start;
  console.log(`Time taken for sort: ${millisecondsPassed / 1000}s`);
}