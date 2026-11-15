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
    constructor(dataItems) {
        this.dataItems = dataItems;
    };

    render() {
        if (!this.dataItems || this.dataItems.length === 0) {
            return "<p>No entries found for this category.</p>";
        }

        const keys = Object.keys(this.dataItems[0]);

        let tableHeader = "<thead><tr>";
        tableHeader += keys.map(key => `<th>${key}</th>`).join('');
        tableHeader += "</tr></thead>";

        let tableBody = "<tbody>";
        for (const dataItem of this.dataItems) {
            tableBody += "<tr>" + keys.map(key =>`<td>${dataItem[key]}</td>` ).join('') +"</tr>"
        };
        tableBody += "</tbody>";

        return `<table>${tableHeader}${tableBody}</table>`;
    };
}

// Tab component managing section visibility and table injection
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

        const table = new Table(this.dataItems);
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

        document.addEventListener('click',(e) => this.switchTab(e))

        this.tabs[0].show(true);
    };

    switchTab(e) {
        const activeTabId = e.target.dataset["id"];
        if (activeTabId) {
            for (const tab of this.tabs) {
                //const isTarget = tab.id === activeTabId;
                tab.show(tab.id === activeTabId);
            }
        }
    };
}

const app = new App();
app.start();