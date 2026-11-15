const suspects = [
    {
        "id": 1,
        "name": "Lady Eleanor Vance",
        "alias": "The Widow",
        "alibi": "Reading in the Library",
        "motive": "Inheritance money",
        "suspicionLevel": "High",
        "isGuilty": true
    },
    {
        "id": 2,
        "name": "Colonel Arthur Mustard",
        "alias": "The Veteran",
        "alibi": "Playing Billiards",
        "motive": "Old feud",
        "suspicionLevel": "Medium",
        "isGuilty": false
    },
    {
        "id": 3,
        "name": "Doctor Gregory Black",
        "alias": "The Physician",
        "alibi": "Preparing medicine",
        "motive": "Blackmail threat",
        "suspicionLevel": "Low",
        "isGuilty": false
    }
];

const clues = [
    {
        "id": 101,
        "title": "Torn Fabric",
        "type": "Physical Evidence",
        "foundLocation": "Conservatory",
        "relevance": "Matches velvet gown",
        "isVerified": true
    },
    {
        "id": 102,
        "title": "Burned Letter",
        "type": "Documentary",
        "foundLocation": "Fireplace",
        "relevance": "Mentions gambling debt",
        "isVerified": true
    },
    {
        "id": 103,
        "title": "Muddy Footprints",
        "type": "Trace Evidence",
        "foundLocation": "Study Hall",
        "relevance": "Size 8 boot imprint",
        "isVerified": false
    }
];

const rooms = [
    {
        "id": 201,
        "roomName": "Grand Library",
        "floor": "Ground Floor",
        "crimeScene": false,
        "status": "Searched",
        "discoveredCluesCount": 3
    },
    {
        "id": 202,
        "roomName": "Lord's Study",
        "floor": "First Floor",
        "crimeScene": true,
        "status": "Sealed",
        "discoveredCluesCount": 5
    },
    {
        "id": 203,
        "roomName": "Wine Cellar",
        "floor": "Basement",
        "crimeScene": false,
        "status": "Unsearched",
        "discoveredCluesCount": 0
    }
];

const objects = [
    {
        "id": 301,
        "objectName": "Antique Dagger",
        "category": "Weapon",
        "material": "Damascus Steel",
        "owner": "Colonel Arthur Mustard",
        "isMurderWeapon": true
    },
    {
        "id": 302,
        "objectName": "Pocket Watch",
        "category": "Personal Item",
        "material": "Gold",
        "owner": "Doctor Gregory Black",
        "isMurderWeapon": false
    },
    {
        "id": 303,
        "objectName": "Poison Vial",
        "category": "Chemical",
        "material": "Glass",
        "owner": "Unknown",
        "isMurderWeapon": false
    }
];

class Table {
    constructor(tabId, dataItems) {
        this.tabId = tabId;
        this.dataItems = dataItems;
    };

    addInputRow(keys){
        let inputRowHtml = "<tr class=\"input-row\">";
        for (const key of keys) {
            if (key === "id") {
                const nextId = this.dataItems.length > 0 ? Math.max(...this.dataItems.map(item => item.id)) + 1 : 1;
                inputRowHtml += `<td><input type="number" data-key="${key}" value="${nextId}" readonly /></td>`;
            } else {
                const sampleValue = this.dataItems[0][key];
                if (typeof sampleValue === "boolean") {
                    inputRowHtml += `<td>
                        <select data-key="${key}">
                            <option value="true">Yes</option>
                            <option value="false" selected>No</option>
                        </select>
                    </td>`;
                } else if (typeof sampleValue === "number") {
                    inputRowHtml += `<td><input type="number" data-key="${key}" placeholder="Enter ${key}" /></td>`;
                } else {
                    inputRowHtml += `<td><input type="text" data-key="${key}" placeholder="Enter ${key}" /></td>`;
                }
            }
        }
        inputRowHtml += `<td><button class="add-button" data-action="add" data-table="${this.tabId}">Add</button></td></tr>`;
        return inputRowHtml;
    };
    render(){
        if (!this.dataItems || this.dataItems.length === 0) {
            return "<p>No entries found for this category.</p>";
        }

        const keys = Object.keys(this.dataItems[0]);

        let tableHeader = "<thead><tr>";
        tableHeader += keys.map(key => `<th>${key}</th>`).join('');
        tableHeader += "</tr></thead>";
        let tableBody = "<tbody>";
        tableBody += this.addInputRow(keys);
        for (const dataItem of this.dataItems) {
            tableBody += "<tr>" + keys.map(key =>`<td>${dataItem[key]}</td>` ).join('') +"</tr>"
        };
        tableBody += "</tbody>";

        return `<table>${tableHeader}${tableBody}</table>`;
    };
}
class Tab {
    constructor(id, title, dataItems) {
        this.id = id;
        this.title = title;
        this.dataItems = dataItems;
        this.tab = this.renderButton();
        this.content = this.renderContent();
    };

    renderButton() {
        const button = document.createElement("button");
        button.className = "tab-button";
        button.textContent = this.title;
        button.dataset["id"] = this.id;
        return button;
    };

    renderContent() {
        const section = document.createElement("section");
     //   section.id = this.id;
        section.className = "tab-content";

        const table = new Table(this.id, this.dataItems);
        section.innerHTML = table.render();
        return section;
    };

    show(isShown) {
        const contentClassList = this.content.classList;
        const tabClassList = this.tab.classList;
        if (isShown) {
            contentClassList.add("active");
            tabClassList.add("active");
        } else {
            contentClassList.remove("active");
            tabClassList.remove("active");
        }

    };

    refreshContent() {
        const table = new Table(this.id, this.dataItems);
        this.content.innerHTML = table.render();
    };
}

class App {
    constructor() {
        this.tabs = [
            new Tab("suspects", "Suspects", suspects),
            new Tab("clues", "Clues", clues),
            new Tab("rooms", "Rooms", rooms),
            new Tab("objects", "Objects", objects)
        ];
    };

    start() {
        const buttonContainer = document.getElementById("tab-buttons-container");
        const contentContainer = document.getElementById("tab-contents-container");
        buttonContainer.append(...this.tabs.map(t => t.tab))
        contentContainer.append(...this.tabs.map(t => t.content))

        document.addEventListener('click',(e) => this.handleClick(e))

        this.tabs[0].show(true);
    };

    handleClick(e) {
        const activeTabId = e.target.dataset["id"];
        if (activeTabId) {
            for (const tab of this.tabs) {
                tab.show(tab.id === activeTabId);
            }
        }

        const action = e.target.dataset["action"];
        if (action === "add") {
            this.addNewItem(e.target.dataset["table"]);
        }
    };

    addNewItem(tableId) {
        const targetTab = this.tabs.find(tab => tab.id === tableId);
        if (!targetTab) return;

        const section = targetTab.content;
        const inputRow = section.querySelector(".input-row");
        const inputs = inputRow.querySelectorAll("input, select");

        const newItem = {};
        for (const input of inputs) {
            const key = input.dataset["key"];
            let value = input.value;

            if (input.type === "number") {
                value = Number(value);
            } else if (input.type === "boolean") {
                value = Boolean(value);
            }

            newItem[key] = value;
        }

        targetTab.dataItems.push(newItem);
        targetTab.refreshContent();
    };
}

const app = new App();
app.start();