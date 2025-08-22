const branchForm = document.getElementById('branch-form');
const suffixForm = document.getElementById('suffix-form');
const mainContainers = document.querySelectorAll('.main-container');
const navContainers = document.querySelectorAll('.nav-container');

// BRANCHES
const baseInput = document.getElementById('base');
const jiraInput = document.getElementById('jira');
const descriptionInput = document.getElementById('description');

const branchCopiedSpan = document.querySelector('.branch-copied');
const branchErrorSpan = document.querySelector('.branch-error');
const branchSubmitBtn = document.querySelector('.branch-submit');

// SUFFIXES
const prefixInput = document.getElementById('prefix');
const prefixList = document.getElementById('prefix-list');
const prefixSubmitBtn = document.querySelector('.prefix-submit');

const prefixErrorSpan = document.querySelector('.prefix-error');
const prefixCopiedSpan = document.querySelector('.prefix-copied');

const BRANCH_BASE = 'branchBase';
const JIRA_TICKET = 'jiraTicket';
const TICKET_DESCRIPTION = 'ticketDescription';
const SUFFIXES = 'suffixes';

async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
        alert('Failed to copy: ', err);
    }
}

// BRANCH
branchForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    branchCopiedSpan.textContent = '';   
    branchErrorSpan.textContent = '';
    const storedBranchBase = localStorage.getItem(BRANCH_BASE);

    const branchBase = baseInput.value;
    const jiraValue = jiraInput.value;
    const descriptionValue = descriptionInput.value;

    if (!branchBase || !jiraValue || !descriptionValue) {
        branchErrorSpan.textContent = 'Please fill in all fields';
        return;
    }
    
    const ticketMatcher = jiraValue.indexOf('?') > -1 ? (/(SHRP-|UF-).+?(?=\?)/) : /(SHRP-|UF-).+/;
    const ticketResult = jiraValue.match(ticketMatcher);

    if (!ticketResult) {
        branchErrorSpan.textContent = 'Invalid JIRA link or ticket number';
        jiraInput.focus();
        return;
    }

    const jiraTicket = ticketResult[0].toLowerCase();
    const description = descriptionValue.split(' ').map(str => str.toLowerCase()).join('-')

    if (!storedBranchBase || storedBranchBase !== branchBase) {
        localStorage.setItem(BRANCH_BASE, branchBase);
    }

    // Reset inputs and localStorage
    localStorage.setItem(JIRA_TICKET, '');
    localStorage.setItem(TICKET_DESCRIPTION, '');
    jiraInput.value = '';
    descriptionInput.value = '';

    const branchName = `${branchBase}/${jiraTicket}-${description}`;
    await copyTextToClipboard(branchName);
    branchCopiedSpan.innerHTML = `Copied to clipboard:<p>${branchName}</p>`;
    branchSubmitBtn.textContent = 'Copied!';

    setTimeout(() => {
        branchSubmitBtn.textContent = 'Copy';
    }, 1000);
});

jiraInput.addEventListener('input', function() {
    const jiraValue = jiraInput.value;
    localStorage.setItem(JIRA_TICKET, jiraValue);
});

descriptionInput.addEventListener('input', function() {
    const descriptionValue = descriptionInput.value;
    localStorage.setItem(TICKET_DESCRIPTION, descriptionValue);
});

// SUFFIX
function buildPrefixList(storedSuffixes) {
    prefixList.innerHTML = ''; // Clear existing list items
    if (storedSuffixes) {
        storedSuffixes.forEach(suffix => {
            const listItem = document.createElement('li');
            listItem.textContent = suffix;
            prefixList.appendChild(listItem);
        });
    }
}

suffixForm.addEventListener('submit', function(event) {
    prefixErrorSpan.textContent = '';
    event.preventDefault();

    const prefixValue = prefixInput.value.trim();
    
    if (!prefixValue) {
        prefixErrorSpan.textContent = 'Please enter a prefix';
        return;
    }
    
    const currentSitePrefixes = JSON.parse(localStorage.getItem(SUFFIXES)) || [];
    if (currentSitePrefixes.find(prefix => prefix.toLowerCase() === prefixValue.toLowerCase())) {
        prefixErrorSpan.textContent = 'Prefix already exists';
        return;
    }
    currentSitePrefixes.push(prefixValue);
    localStorage.setItem(SUFFIXES, JSON.stringify(currentSitePrefixes));
    buildPrefixList(currentSitePrefixes);
    prefixInput.value = '';

    prefixSubmitBtn.textContent = 'Added!';

    setTimeout(() => {
        prefixSubmitBtn.textContent = 'Add';
    }, 1000);

});

function checkLocalStorage() {
    const storedBranchBase = localStorage.getItem(BRANCH_BASE);
    const storedJiraTicket = localStorage.getItem(JIRA_TICKET);
    const storedDescription = localStorage.getItem(TICKET_DESCRIPTION);
    const storedSuffixes = JSON.parse(localStorage.getItem(SUFFIXES));
    if (storedBranchBase) {
        baseInput.value = storedBranchBase;
    }
    if (storedJiraTicket) {
        jiraInput.value = storedJiraTicket;
    }
    if (storedDescription) {
        descriptionInput.value = storedDescription;
    }
    if (storedSuffixes) {
        buildPrefixList(storedSuffixes);
    }
}

navContainers.forEach(nav => {
    nav.addEventListener('click', function(e) {
        const clickedNavId = e.target.getAttribute('id');

        navContainers.forEach(nav => {
            const navId = nav.getAttribute('id');
            if (clickedNavId === navId) {
                nav.classList.add('selected');
            } else {
                nav.classList.remove('selected');
            }
        });
        
        mainContainers.forEach(main => {
            const navContainerId = main.getAttribute('id');
            const selectedMainId = `${clickedNavId}-container`;
            if (navContainerId === selectedMainId) {
                main.classList.remove('hide');
                main.classList.add('show');
            } else {
                main.classList.add('hide');
                main.classList.remove('show');
            }
        });
    });
});

checkLocalStorage();