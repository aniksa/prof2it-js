const loadData = (key, defaultData) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
};

let suspects = loadData("murdoku_suspects", [
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
]);

let clues = loadData("murdoku_clues", [
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
]);

let rooms = loadData("murdoku_rooms", [
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
]);

let objects = loadData("murdoku_objects", [
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
]);

class Table {
    constructor(tabId, dataItems) {
        this.tabId = tabId;
        this.dataItems = dataItems;
    };

    addInputRow(keys) {
        let inputRowHtml = "<tr class=\"input-row\">";
        for (const key of keys) {
            if (key === "id") {
                const nextId = this.dataItems.length > 0 ? Math.max(...this.dataItems.map(item => item.id)) + 1 : 1;
                inputRowHtml += `<td><input type="number" data-key="${key}" value="${nextId}" readonly /></td>`;
            } else if (this.tabId === "objects" && key === "owner") {
                let optionsHtml = `<option value="Unknown">Unknown</option>`;
                suspects.forEach(suspect => {
                    optionsHtml += `<option value="${suspect.name}">${suspect.name}</option>`;
                });
                inputRowHtml += `<td><select data-key="${key}">${optionsHtml}</select></td>`;
            } else if (this.tabId === "clues" && key === "foundLocation") {
                let optionsHtml = "";
                rooms.forEach(room => {
                    optionsHtml += `<option value="${room.roomName}">${room.roomName}</option>`;
                });
                inputRowHtml += `<td><select data-key="${key}">${optionsHtml}</select></td>`;
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

    render() {
        if (!this.dataItems || this.dataItems.length === 0) {
            return "<p>No entries found for this category.</p>";
        }

        const keys = Object.keys(this.dataItems[0]);

        let tableHeader = "<thead><tr>";
        for (const key of keys) {
            let formattedHeader = key.replace(/([A-Z])/g, " $1");
            formattedHeader = formattedHeader.charAt(0).toUpperCase() + formattedHeader.slice(1);
            tableHeader += "<th>" + formattedHeader + "</th>";
        };
        tableHeader += "<th>Action</th></tr></thead>";

        let tableBody = "<tbody>";
        tableBody += this.addInputRow(keys);

        for (const dataItem of this.dataItems) {
            tableBody += "<tr>";
            for (const key of keys) {
                let cellValue = dataItem[key];
                if (typeof cellValue === "boolean") {
                    cellValue = cellValue ? "Yes" : "No";
                }
                const isEditable = key !== "id";
                const editableAttr = isEditable ? `contenteditable="true" class="editable-cell"` : "";
                tableBody += `<td ${editableAttr} data-key="${key}" data-id="${dataItem.id}">${cellValue}</td>`;
            }
            tableBody += `<td><button class="delete-button" data-action="delete" data-table="${this.tabId}" data-id="${dataItem.id}">❌</button></td>`;
            tableBody += "</tr>";
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
    loadAllData(){
        suspects = loadData("murdoku_suspects", suspects);
        clues = loadData("murdoku_clues", clues);
        rooms = loadData("murdoku_rooms", rooms);
        objects = loadData("murdoku_objects", objects);
    }
    start() {
        const buttonContainer = document.getElementById("tab-buttons-container");
        const contentContainer = document.getElementById("tab-contents-container");
        buttonContainer.append(...this.tabs.map(t => t.tab));
        contentContainer.append(...this.tabs.map(t => t.content));

        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('blur', (e) => this.handleCellBlur(e), true);
        document.addEventListener('keydown', (e) => this.handleCellKeydown(e));

        // Завдання №4.3: Синхронізація між вкладками браузера (оновлюємо всі дані та перемальовуємо таби)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith("murdoku_")) {
                this.loadAllData();

                // Оновлюємо дані у кожному табі та перемальовуємо інтерфейс
                this.tabs.forEach(tab => {
                    if (tab.id === "suspects") tab.dataItems = suspects;
                    if (tab.id === "clues") tab.dataItems = clues;
                    if (tab.id === "rooms") tab.dataItems = rooms;
                    if (tab.id === "objects") tab.dataItems = objects;
                    tab.refreshContent();
                });
            }
        });

        this.tabs[0].show(true);
    };

    saveData(tableId) {
        const targetTab = this.tabs.find(t => t.id === tableId);
        if (targetTab) {
            localStorage.setItem(`murdoku_${tableId}`, JSON.stringify(targetTab.dataItems));
        }
    }

    handleClick(e) {
        const activeTabId = e.target.dataset["id"];
        if (activeTabId && e.target.classList.contains("tab-button")) {
            for (const tab of this.tabs) {
                tab.show(tab.id === activeTabId);
            }
        }

        const action = e.target.dataset["action"];
        if (action === "add") {
            this.addNewItem(e.target.dataset["table"]);
        } else if (action === "delete") {
            this.deleteItem(e.target.dataset["table"], Number(e.target.dataset["id"]));
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
            } else if (value === "true" || value === "false") {
                value = value === "true";
            }

            newItem[key] = value;
        }

        targetTab.dataItems.push(newItem);
        this.saveData(tableId);
        targetTab.refreshContent();
    };

    isDataUsed(itemToDelete) {
        this.loadAllData();
        const allItems = [...suspects, ...clues, ...rooms, ...objects];
        const allValues = allItems.flatMap(item => Object.values(item));

        let numFound = 0;
        const itemsInRow = Object.values(itemToDelete).filter(value => {
            if (typeof(value) === "boolean" || typeof(value) === "number") return false;
            return true;
        });

        for (const item of itemsInRow) {
            numFound = Math.max(numFound, allValues.filter(value => value === item).length);
        }

        return numFound > 1;
    }

    deleteItem(tableId, itemId) {
        const targetTab = this.tabs.find(tab => tab.id === tableId);
        if (!targetTab) return;

        const itemToDelete = targetTab.dataItems.find(item => item.id === itemId);
        if (!itemToDelete) return;

        if (tableId !== "objects" && tableId !== "clues" && this.isDataUsed(itemToDelete)) {
            alert("Неможливо видалити елемент, бо він використовується");
            return;
        }

        targetTab.dataItems = targetTab.dataItems.filter(item => item.id !== itemId);
        this.saveData(tableId);
        targetTab.refreshContent();
    };

    updateCellData(cell) {
        const key = cell.dataset["key"];
        const itemId = Number(cell.dataset["id"]);
        let newValue = cell.textContent.trim();

        const activeSection = cell.closest("section");
        const targetTab = this.tabs.find(tab => tab.content === activeSection);
        if (!targetTab) return;

        const dataItem = targetTab.dataItems.find(item => item.id === itemId);
        if (!dataItem) return;

        const originalValue = dataItem[key];

        if (typeof originalValue === "number") {
            newValue = Number(newValue);
        } else if (typeof originalValue === "boolean") {
            newValue = (newValue.toLowerCase() === "yes" || newValue.toLowerCase() === "true");
        }

        dataItem[key] = newValue;
        this.saveData(targetTab.id);
    }

    isCellEditable(cell) {
        return cell.classList && cell.classList.contains("editable-cell");
    }

    handleCellBlur(e) {
        const cell = e.target;
        if (this.isCellEditable(cell)) {
            this.updateCellData(cell);
        }
    }

    handleCellKeydown(e) {
        const cell = e.target;
        if (this.isCellEditable(cell)) {
            if (e.key === "Enter") {
                e.preventDefault();
                cell.blur();
            }
        }
    }
}

const app = new App();
app.start();