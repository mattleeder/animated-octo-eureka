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
  console.log(callingElement);
  columnIndex = parseInt(callingElement.parentElement.dataset.columnIndex);
  sortState = callingElement.dataset.sortState;
  if (sortState == "-1") {
    console.log("MINUS");

    // Remove sort
    console.log(`Sort order dataset: ${callingElement.dataset.sortOrder}`);
    callingElement.dataset.sortOrder = callingElement.dataset.sortOrder.replace(`-${columnIndex},`, "");

    // Set state to 0
    callingElement.dataset.sortState = "0";
    callingElement.classList.replace("sort-button-down", "sort-button-both");

    // Check if sort order is empty
    if (callingElement.dataset.sortOrder == "") {
      console.log("Early return");
      return;
    }

  } else if (sortState == "0") {
    console.log("ZEROOO");
    console.log(`Sort order dataset: ${callingElement.dataset.sortOrder}`);

    // Append the column index to the sort order
    callingElement.dataset.sortOrder += `${columnIndex},`;

    // Set state to 1
    callingElement.dataset.sortState = "1";
    callingElement.classList.replace("sort-button-both", "sort-button-up");

  } else if (sortState == "1") {
    console.log("ONE");

    // Reverse sort order
    console.log(`Sort order dataset: ${callingElement.dataset.sortOrder}`);
    callingElement.dataset.sortOrder = callingElement.dataset.sortOrder.replace(`${columnIndex},`, `-${columnIndex},`);

    // Set state to -1
    callingElement.dataset.sortState = "-1";
    callingElement.classList.replace("sort-button-up", "sort-button-down");

  }

  // Parse the sort order
  sortOrder = callingElement.dataset.sortOrder.split(",").slice(0, -1);
  console.log(sortOrder);
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
      console.log(`Row Index: ${i}`);
      shouldSwap = false;

      console.log(`Sort order: ${sortOrder}`);
      // Check each column in the sort order
      for (j = 0; j < sortOrder.length; j++) {
        console.log(`Sort order index: ${j}`);
        columnIndex = sortOrder[j][0];
        sortDirection = sortOrder[j][1];
        first = rows[i].getElementsByTagName("td")[columnIndex];
        second = rows[i + 1].getElementsByTagName("td")[columnIndex];
        if (first == second) {
          continue;
        }
        break;
      }
      
      console.log(`Comparing: ${first.innerHTML} and ${second.innerHTML} with sort direction ${sortDirection}`);
      if (notSorted(first.innerHTML.toUpperCase(), second.innerHTML.toUpperCase(), sortDirection)) {
        shouldSwap = true;
        break;
      }
    }

    if (shouldSwap) {
      console.log("Swapping");
      rows[i].parentElement.insertBefore(rows[i + 1], rows[i]);
      sorting = true;
    }
  }

}

function notSorted(first, second, sortDirection) {
  // If sort direction is -1 we must sort in reverse
  if (sortDirection == -1) {
    console.log(`Returning ${first < second}`);
    return first < second;
  }
  // Otherwise sort direction is 1 and we should sort forwards
  console.log(`Returning ${first > second}`);
  return first > second;
}