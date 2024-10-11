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
  table = document.getElementsByTagName("table")[0];
  sorting = true;

  while (sorting) {
    sorting = false;
    rows = table.rows;

    for (i = 1; i < (rows.length - 1); i++) {
      console.log(`i: ${i}`);
      shouldSwap = false;

      first = rows[i].getElementsByTagName("td")[columnIndex];
      second = rows[i + 1].getElementsByTagName("td")[columnIndex];
      console.log(`Comparing: ${first.innerHTML} and ${second.innerHTML}`);
      if (notSorted(first.innerHTML.toUpperCase(), second.innerHTML.toUpperCase(), sortState)) {
        shouldSwap = true;
        console.log("Break");
        break;
      }
    }

    if (shouldSwap) {
      console.log(`i: ${i}`);
      console.log("Swapping");
      rows[i].parentElement.insertBefore(rows[i + 1], rows[i]);
      sorting = true;
    }
  }

  if (sortState == "1") {
    callingElement.dataset.sortState = "0";
    callingElement.classList.replace("sort-button-down", "sort-button-up");
    callingElement.classList.replace("sort-button-both", "sort-button-up");
  } else {
    callingElement.dataset.sortState = "1";
    callingElement.classList.replace("sort-button-up", "sort-button-down");
  }
}

function notSorted(first, second, sortState) {
  // If sort state is 0 we must sort in reverse
  if (sortState == "0") {
    console.log(`Returning ${first < second}`);
    return first < second;
  }
  // Otherwise sort state is 1 and we should sort forwards
  console.log(`Returning ${first > second}`);
  return first > second;
}