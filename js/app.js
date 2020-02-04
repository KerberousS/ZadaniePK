var unfilteredReportsList = [];
var yearFilterElements = [];
var categoryFilterElements = [];

const AllFilterText = 'Wszystkie';
const noResultsText = 'Brak raportów dla wybranch kryteriów wyszukiwania';

fetch('/data.json').then(function (response) {
    return response.json();
}).then(function (data) {
    unfilteredReportsList = data;
    prepareReportsData(unfilteredReportsList).then(function (reportData){
        populateDOMWithReportData(reportData);
    });
}).catch(function (err) {
    console.warn(err); //TODO: Since this is a fetch and there can always happen something wrong on backend, this should have some kind of user interaction if it breaks, eventual TODO
});

async function prepareReportsData(reportList) {
    var reportYearsList = [];
    var reportCategories = [];

    for (let i = 0; i < reportList.length; i++) {
        addYearsToList(reportList[i].date);
        addCategoriesToList(reportList[i].category);
    }

    function addYearsToList(date) {
        var dateObj = new Date(date); //Convert datas info to data obj
        var year = dateObj.getFullYear(); //Convert Date obj to actual year

        if (reportYearsList.length == 0) {
            reportYearsList.push(year);
        } //If there are isnt any record in reportYearsList just push it into array

        if (!reportYearsList.includes(year)) { //If this year isn't on the list yet
            for (let i = 0; i < reportYearsList.length; i++) { //Check full date array for years
                if (year < reportYearsList[i]) { //If the year is lower from currents array number, add it to before the current array index
                    reportYearsList.splice(i, 0, year);
                    break;
                } else if (year > reportYearsList[i]) { //If the year is bigger from current year, then check from the end of the loop
                    for (let i2 = reportYearsList.length; i2 > 0; i2--) { //End of the loop should have biggest numbers allowing for a good check to be made
                        if (year == reportYearsList[i2]) { //If year already exists, ignore it
                            break;
                        } else if (year > reportYearsList[i2]) {
                            reportYearsList.splice(i2 + 1, 0, year); //If year is bigger than the next year, at it after the current array index
                            break;
                        }
                    }
                    break;
                }
            }
            //Kind of hideous but works, could use lodash functions to make it more clear to look at
        }
    }

        function addCategoriesToList(category) {
            if (!reportCategories.includes(category)) { //If this category isn't on the list yet
            reportCategories.push(category)
            reportCategories.sort(); //Sort categories alphabetically
        }
    }

    reportList.yearsList = reportYearsList.reverse(); //Reverse years so they're from newest to oldest
    reportList.reportCategories = reportCategories;

    return reportList;
}

function populateDOMWithReportData(reportsList) {
    populateCategoryFilter(reportsList.reportCategories);
    populateYearFilter(reportsList.yearsList);
    populateReportList(reportsList);
}

function populateCategoryFilter(categoryList) {
    var myElement = document.getElementsByClassName('filter-buttons')

    //Add default option
    const defaultOption = document.createElement('button');
    defaultOption.setAttribute('class', 'filter-button active');
    defaultOption.innerHTML = AllFilterText;

    const defaultOptionFragment = document.createDocumentFragment();
    
    defaultOptionFragment.appendChild(defaultOption);
    myElement[0].appendChild(defaultOptionFragment);

    for (i=0; i<categoryList.length; i++) {
        const option = document.createElement('button');
        option.setAttribute('class', 'filter-button');
        option.innerHTML = categoryList[i];
    
        const fragment = document.createDocumentFragment();
    
        fragment.appendChild(option);
        myElement[0].appendChild(fragment);
    }
}

function populateYearFilter(yearList) {
    var myElement = document.getElementsByClassName('reports-year-filter')

    for (i=0; i<yearList.length; i++) {
        const option = document.createElement('option');
        option.setAttribute('class', 'filter-year-option');
        option.setAttribute('value', yearList[i]);
        option.innerHTML = yearList[i]; //Possible TODO in Future; add style to selected option
    
        const fragment = document.createDocumentFragment();
    
        fragment.appendChild(option);
        myElement[0].appendChild(fragment);
    }
}

function getHTMLReportElement(report) {
    const listItem = document.createElement('li');
    listItem.setAttribute('class', 'report-item');

    const basicGrid = document.createElement('div');
    basicGrid.setAttribute('class', 'grid-x grid-padding-x');

    const dateTextGridSpace = document.createElement('div');
    dateTextGridSpace.setAttribute('class', 'large-2');

    const dateTextGrid = document.createElement('div');
    dateTextGrid.setAttribute('class', 'grid-y report-text-container');

    const dateText = document.createElement('span');
    dateText.setAttribute('class', 'report-date');

    //Get date objects
    const dateObj = new Date(report.date);
    let dayString = dateObj.toLocaleString();

    //Split full time string into time and date
    var dayStringSplit = dayString.split(', ')
    var date = dayStringSplit[0];
    var time = dayStringSplit[1];

    //Split date into seperate DD MM YYYY so day can be force-fixed into a 2 number value
    var dateSplit = date.split('.');
    var day = dateSplit[0];
    var month = dateSplit[1];
    var year = dateSplit[2];

    //Split time so i can get it without seconds
    var timeSplit = time.split(':');
    var hours = timeSplit[0];
    var minutes = timeSplit[1];

    //Fix 1-numbered days below 10.
    if (day<10) {
        day = '0'+day;
    }

    //Present full time
    const timeText = day + '.' + month + '.' + year + '<br>' + hours + ":" + minutes;
    dateText.innerHTML = timeText;

    const categoryText = document.createElement('span');
    categoryText.setAttribute('class', 'report-category')
    categoryText.innerHTML = report.category;      

    const reportInfoTextGridSpace = document.createElement('div');
    reportInfoTextGridSpace.setAttribute('class', 'large-10');

    const reportTextGrid = document.createElement('div');
    reportTextGrid.setAttribute('class', 'grid-y report-text-container');

    const titleText = document.createElement('span');
    titleText.setAttribute('class', 'report-title')
    titleText.innerHTML = report.title;

    const descriptionText = document.createElement('span');
    descriptionText.setAttribute('class', 'report-description')
    if (report.description.length==0) {
        descriptionText.innerHTML = '&nbsp;'
    } else {
        descriptionText.innerHTML = report.description;
    }

    const linkGridContainer = document.createElement('div');
    linkGridContainer.setAttribute('class', 'grid-x report-text-container');
    
    const seeReportLink = document.createElement('a');
    seeReportLink.setAttribute('class', 'report-download-button');
    seeReportLink.setAttribute('href', '/mock-site'); //TODO: Change this line when there will be URL for file
    seeReportLink.innerHTML = 'Zobacz Raport';
    linkGridContainer.appendChild(seeReportLink);

    if (report.files.length==0) {
        // Do nothing
    } else if (report.files.length==1) {

        const downloadReportLink = document.createElement('a');
        downloadReportLink.setAttribute('class', 'report-download-button');
        downloadReportLink.setAttribute('href', '/mock-site'); //TODO: Change this line when there will be URL for file
        downloadReportLink.innerHTML = 'Pobierz ' + report.files[0].filename + '(' + report.files[0].filesize + ")";
        linkGridContainer.appendChild(downloadReportLink);

    } else if (report.files.length>1) {

        const filesSelect = document.createElement('div');
        filesSelect.setAttribute('class', 'file-select'); //Check if theres an option to do this element other way

        const seeMoreReportAccordion = document.createElement('a');
        seeMoreReportAccordion.setAttribute('class', 'file-accordion active');
        seeMoreReportAccordion.innerHTML = 'Pliki do pobrania (' + report.files.length +')';

        const reportItemsAccordionContainer = document.createElement('div');
        reportItemsAccordionContainer.setAttribute('class', 'grid-y report-items-accordion hidden');
        

        for (let i2=0; i2<report.files.length; i2++) {
            const fileLink = document.createElement('a');
            fileLink.setAttribute('href', '/mock-site'); //Change this to a file's link
            fileLink.innerHTML = report.files[i2].filename + ' (' + report.files[i2].filesize +'kb)';
            reportItemsAccordionContainer.append(fileLink);
        }
        
        seeMoreReportAccordion.appendChild(reportItemsAccordionContainer);
        filesSelect.appendChild(seeMoreReportAccordion);
        linkGridContainer.appendChild(filesSelect);

    }


    //Append data info to text container
    reportTextGrid.appendChild(titleText);
    reportTextGrid.appendChild(descriptionText);

    //Append info text to large-10 grid
    reportInfoTextGridSpace.appendChild(reportTextGrid);
    reportInfoTextGridSpace.appendChild(linkGridContainer);

    //Append data to large-2 grid
    dateTextGrid.appendChild(dateText);
    dateTextGrid.appendChild(categoryText);
    dateTextGridSpace.appendChild(dateTextGrid);

    //Append all data to main grid
    basicGrid.appendChild(dateTextGridSpace);
    basicGrid.appendChild(reportInfoTextGridSpace);
    
    //Append grid to listitem
    listItem.appendChild(basicGrid);

    const fragment = document.createDocumentFragment();

    fragment.appendChild(listItem);

    return fragment;
}

function populateReportList(reports) {
    let reportsContainer = document.getElementsByClassName('reports-container')

    reports = reports.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0)); //It appears to be sorted by date, from newest to oldest on screenshot

    for (let i=0; i<reports.length; i++) {
        let fragment = getHTMLReportElement(reports[i]);
        reportsContainer[0].appendChild(fragment);
    }
    initializeFilters();
}

function rePopulateReportList(reports) {
    let reportsContainer = document.getElementsByClassName('reports-container')

        while (reportsContainer[0].firstChild) {
            reportsContainer[0].removeChild(reportsContainer[0].firstChild);
          }

          if (reports.length<1) {
            reportsContainer[0].innerText = noResultsText;
          } else {
            reports = reports.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0)); //It appears to be sorted by date, from newest to oldest on screenshot
    
            for (let i=0; i<reports.length; i++) {
                let fragment = getHTMLReportElement(reports[i]);
                reportsContainer[0].appendChild(fragment);
            }
          }
          addDropdownToFiles();
}

function addDropdownToFiles() {
    let reportsAccordions = document.getElementsByClassName('file-accordion')

      if (reportsAccordions.length>=1) {

        for (let i=0; i<reportsAccordions.length; i++) {
            reportsAccordions[i].addEventListener('click', function() {
                this.classList.toggle('active');
                var itemAccordion = this.getElementsByClassName('report-items-accordion');
                itemAccordion[0].classList.toggle('hidden');
                //This should be redone to some other way, this is filthy a bit
            })
        }
      }
}

function initializeFilters() {

    initializeYearFilters();
    initializeCategoryFilters();
    initializeSearchFilters();

    function initializeYearFilters() {
        var selectYearFilter = document.getElementsByClassName('reports-year-filter');
        for (let i=0; i<selectYearFilter.length; i++) {
            selectYearFilter[i].addEventListener('change', filterReports);
        }
    }

    function initializeCategoryFilters() {
        filterReports();
        var filterButtonList = document.getElementsByClassName('filter-button');
        for (let i=0; i<filterButtonList.length; i++) {
            filterButtonList[i].addEventListener('click', function() {
                if (event.srcElement.innerText!='Wszystkie') {

                    let allCategoryButton = document.querySelector('.filter-buttons >.filter-button');
                    allCategoryButton.classList.remove('active');

                    let choosenCategory = event.srcElement;
                    choosenCategory.classList.toggle('active');
                    if ((document.querySelectorAll('.filter-button.active')).length==0) {
                        allCategoryButton.classList.add('active');
                    }
                    filterReports();
                } else {
                    let activeCategories = document.querySelectorAll('.filter-button.active');
                    for (let i=0; i<activeCategories.length; i++) {
                        activeCategories[i].classList.toggle('active');
                    }
                    let allCategoryButton = document.querySelector('.filter-buttons >.filter-button');
                    allCategoryButton.classList.add('active');
                    filterReports();
                }
            })
        }
    }

    function initializeSearchFilters() {
        let searchInput = document.querySelector('.search-input-wrapper > input');
        searchInput.addEventListener('keyup', filterReports) //The search goes off after keyup, can be changed for blur i guess if needed since now 'Search' button has no use whatsoever
    }
}

function filterReports() {
    let activeCategoryElements = document.getElementsByClassName('filter-button active');
    let selectedCategories = [];

    for (let i=0; i<activeCategoryElements.length; i++) {
        if (activeCategoryElements[i].innerText!='Wszystkie') {
            selectedCategories.push(activeCategoryElements[i].innerText);
        }
    }

    let yearSelectElement = document.getElementsByClassName('reports-year-filter');
    let selectedYear = yearSelectElement[0].value;
    
    let searchInput = document.querySelector('.search-input-wrapper > input');
    let searchValue = searchInput.value;

    var yearFilteredReportsList = [];
    var categoryFilteredReportsList = [];
    var searchFilteredReportsList = [];

    if (selectedYear!=null) {
        for (let i=0; i<unfilteredReportsList.length; i++) {
            let dateObj = new Date(unfilteredReportsList[i].date); //Convert datas info to data obj
            let year = dateObj.getFullYear(); //Convert Date obj to actual year

            if (selectedYear == year) {
                yearFilteredReportsList.push(unfilteredReportsList[i]);
            }
        }
    }
    if (selectedCategories.length>0) {
        for (let i=0; i<selectedCategories.length; i++) {
            for (let i2=0; i2<yearFilteredReportsList.length; i2++) {
                if (selectedCategories[i]==yearFilteredReportsList[i2].category) {
                    categoryFilteredReportsList.push(yearFilteredReportsList[i2])
                }
        }
    }
} else {
    categoryFilteredReportsList = yearFilteredReportsList;
}
    if (searchValue.length>0) {
        var searchFilteredReportsList = [];
            for (let i=0; i<categoryFilteredReportsList.length; i++) {
                if ((categoryFilteredReportsList[i].title).includes(searchValue) || (categoryFilteredReportsList[i].description).includes(searchValue)) { //TODO: Should this be case-sensitive?
                    searchFilteredReportsList.push(categoryFilteredReportsList[i])
                }
        }
    } else {
        searchFilteredReportsList = categoryFilteredReportsList;
    }

    rePopulateReportList(searchFilteredReportsList);
}