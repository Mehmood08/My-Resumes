
const BASE_URL = 'http://localhost:3001/api/resumes';

async function testCRUD() {
    console.log("Starting CRUD Test against Local Server...\n");

    const testId = "crud-test-" + Date.now();
    let createdItem = null;

    // 1. CREATE
    console.log(`1. Testing CREATE (POST)...`);
    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: testId,
                title: "CRUD Test Resume",
                desc: "# Test Content",
                date: new Date().toLocaleDateString()
            })
        });
        if (!res.ok) throw new Error(`POST failed: ${res.status} ${res.statusText}`);
        createdItem = await res.json();
        console.log("   [PASS] Created item:", createdItem.id);
    } catch (err) {
        console.error("   [FAIL] Create:", err.message);
        process.exit(1);
    }

    // 2. READ ALL
    console.log(`\n2. Testing READ ALL (GET)...`);
    try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error(`GET All failed: ${res.status}`);
        const list = await res.json();
        const found = list.find(r => r.id === testId);
        if (found) console.log("   [PASS] Found created item in list.");
        else throw new Error("Item not found in list");
    } catch (err) {
        console.error("   [FAIL] Read All:", err.message);
        process.exit(1);
    }

    // 3. UPDATE
    console.log(`\n3. Testing UPDATE (PUT)...`);
    try {
        const res = await fetch(`${BASE_URL}/${testId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: "Updated Title Check" })
        });
        if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
        const updated = await res.json();
        if (updated.title === "Updated Title Check") console.log("   [PASS] Title updated successfully.");
        else throw new Error("Title mismatch");
    } catch (err) {
        console.error("   [FAIL] Update:", err.message);
        process.exit(1);
    }

    // 4. READ ONE
    console.log(`\n4. Testing READ ONE (GET /:id)...`);
    try {
        const res = await fetch(`${BASE_URL}/${testId}`);
        if (!res.ok) throw new Error(`GET One failed: ${res.status}`);
        const item = await res.json();
        if (item.title === "Updated Title Check") console.log("   [PASS] Retrieved correct updated item.");
        else throw new Error("Retrieved item has wrong data");
    } catch (err) {
        console.error("   [FAIL] Read One:", err.message);
        process.exit(1);
    }

    // 5. DELETE
    console.log(`\n5. Testing DELETE (DELETE)...`);
    try {
        const res = await fetch(`${BASE_URL}/${testId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
        console.log("   [PASS] Delete request successful.");
    } catch (err) {
        console.error("   [FAIL] Delete:", err.message);
        process.exit(1);
    }

    // 6. VERIFY DELETE
    console.log(`\n6. Verifying Deletion...`);
    try {
        const res = await fetch(`${BASE_URL}/${testId}`);
        if (res.status === 404) console.log("   [PASS] Item correctly returns 404 (Not Found).");
        else throw new Error(`Expected 404, got ${res.status}`);
    } catch (err) {
        console.error("   [FAIL] Verify Delete:", err.message);
        process.exit(1);
    }

    console.log("\n✅ ALL CRUD TESTS PASSED!");
}

testCRUD();
