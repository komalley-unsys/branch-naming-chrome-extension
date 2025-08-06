const branchForm = document.getElementById('branch-form');
const suffixForm = document.getElementById('suffix-form');
const mainContainers = document.querySelectorAll('.main-container');
const navContainers = document.querySelectorAll('.nav-container');
// BRANCHES
const baseInput = document.getElementById('base');
const jiraInput = document.getElementById('jira');
const descriptionInput = document.getElementById('description');
// SUFFIXES
const prefixInput = document.getElementById('prefix');
const prefixList = document.getElementById('prefix-list');

const copiedSpan = document.getElementById('copied');
const errorSpan = document.getElementById('error');
const submitBtn = document.getElementById('submitButton');

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

    copiedSpan.textContent = '';   
    errorSpan.textContent = '';
    const storedBranchBase = localStorage.getItem(BRANCH_BASE);

    const branchBase = baseInput.value;
    const jiraValue = jiraInput.value;
    const descriptionValue = descriptionInput.value;

    if (!branchBase || !jiraValue || !descriptionValue) {
        errorSpan.textContent = 'Please fill in all fields';
        return;
    }
    
    const ticketMatcher = jiraValue.indexOf('?') > -1 ? (/(SHRP-|UF-).+?(?=\?)/) : /(SHRP-|UF-).+/;
    const ticketResult = jiraValue.match(ticketMatcher);

    if (!ticketResult) {
        errorSpan.textContent = 'Invalid JIRA link or ticket number';
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
    copiedSpan.textContent = branchName;
    submitBtn.textContent = 'Copied!';

    setTimeout(() => {
        submitBtn.textContent = 'Copy';
    }, 500);
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
    if (storedSuffixes) {
        storedSuffixes.forEach(suffix => {
            const listItem = document.createElement('li');
            listItem.textContent = suffix;
            prefixList.appendChild(listItem);
        });
    }
}

suffixForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const currentSitePrefixes = JSON.parse(localStorage.getItem(SUFFIXES)) || [];
    const prefixValue = prefixInput.value.trim();
    console.log(currentSitePrefixes);

    if (!prefixValue) {
        errorSpan.textContent = 'Please enter a prefix';
        return;
    }
    
    const updatedPrefixes = [
        ...currentSitePrefixes,
        prefixValue
    ];

    localStorage.setItem(SUFFIXES, JSON.stringify(updatedPrefixes));

    buildPrefixList(updatedPrefixes);
    prefixInput.value = '';
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

navContainers.forEach(navContainer => {
    navContainer.addEventListener('click', function(e) {
        const navLink = e.target.classList.contains('nav-link') ? e.target : e.target.closest('.nav-link');
        const id = navLink.getAttribute('id');
        const selectedContainer = document.getElementById(`${id}-container`);
        selectedContainer.classList.add('show');
        selectedContainer.classList.remove('hide');
        
        const nonSelectedContainers = Array.from(mainContainers).filter(container => container.id !== `${id}-container`);
        nonSelectedContainers.forEach(container => {
            container.classList.add('hide');
            container.classList.remove('show');
        });

    });
});

checkLocalStorage();