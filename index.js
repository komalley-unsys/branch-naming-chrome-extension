const form = document.getElementById('form');
const baseInput = document.getElementById('base');
const jiraInput = document.getElementById('jira');
const descriptionInput = document.getElementById('description');
const copiedSpan = document.getElementById('copied');
const errorSpan = document.getElementById('error');

const BRANCH_BASE = 'branchBase';

async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
        alert('Failed to copy: ', err);
    }
  }

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    copiedSpan.textContent = '';   
    errorSpan.textContent = '';
    const storedBranchBase = localStorage.getItem(BRANCH_BASE);

    const jiraRoot = 'shrp';
    const branchBase = baseInput.value;
    const jiraValue = jiraInput.value;
    const descriptionValue = descriptionInput.value;

    if (!branchBase || !jiraValue || !descriptionValue) {
        errorSpan.textContent = 'Please fill in all fields';
        return;
    }

    const ticketMatcher = jiraValue.indexOf('?') > -1 ? (/(?<=\SHRP-).+?(?=\?)/) : /(?<=\SHRP-).+/;
    const ticketResult = jiraValue.match(ticketMatcher);
    if (!ticketResult) {
        errorSpan.textContent = 'Invalid JIRA link or ticket number';
        jiraInput.focus();
        return;
    }

    const jiraTicket = `${jiraRoot}-${ticketResult[0]}`;
    const description = descriptionValue.split(' ').map(str => str.toLowerCase()).join('-')

    const branchName = `${branchBase}/${jiraTicket}-${description}`;

    if (!storedBranchBase || storedBranchBase !== branchBase) {
        localStorage.setItem(BRANCH_BASE, branchBase);
    }

    await copyTextToClipboard(branchName);
    copiedSpan.textContent = branchName;
});

function checkLocalStorage() {
    const storedBranchBase = localStorage.getItem(BRANCH_BASE);
    if (storedBranchBase) {
        baseInput.value = storedBranchBase;
    }
}

copiedSpan.textContent = '';
errorSpan.textContent = '';
checkLocalStorage();