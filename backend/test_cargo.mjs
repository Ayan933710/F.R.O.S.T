// Quick E2E test of the cargo ledger endpoints
const BASE = 'http://localhost:5000/api/v1';

async function run() {
  console.log('=== Step 1: Create manifest ===');
  let res = await fetch(`${BASE}/cargo/manifest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      manifest_id: 'TEST-E2E-01',
      items: [{ item_id: '1', qty: 50, name: 'Diesel' }, { item_id: '2', qty: 200, name: 'Rations' }],
      vessel_mmsi: '419000000',
    }),
  });
  console.log(await res.json());

  console.log('\n=== Step 2: Seal manifest (generates SHA-256 hash) ===');
  res = await fetch(`${BASE}/cargo/manifest/TEST-E2E-01/seal`, { method: 'POST' });
  const sealed = await res.json();
  console.log(sealed);
  console.log('Hash:', sealed.crypto_hash);

  console.log('\n=== Step 3: Advance status to In Transit ===');
  res = await fetch(`${BASE}/cargo/manifest/TEST-E2E-01/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'In Transit (Ocean)' }),
  });
  console.log(await res.json());

  console.log('\n=== Step 4a: Verify with CORRECT items (should PASS) ===');
  res = await fetch(`${BASE}/cargo/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      manifest_id: 'TEST-E2E-01',
      items: [{ item_id: '1', qty: 50, name: 'Diesel' }, { item_id: '2', qty: 200, name: 'Rations' }],
      vessel_mmsi: '419000000',
    }),
  });
  console.log(res.status, await res.json());

  console.log('\n=== Step 4b: Verify with TAMPERED items (qty 50→40, should FAIL) ===');
  res = await fetch(`${BASE}/cargo/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      manifest_id: 'TEST-E2E-01',
      items: [{ item_id: '1', qty: 40, name: 'Diesel' }, { item_id: '2', qty: 200, name: 'Rations' }],
      vessel_mmsi: '419000000',
    }),
  });
  console.log(res.status, await res.json());

  console.log('\n=== Step 5: Check manifest — should show tamper_detected=true ===');
  res = await fetch(`${BASE}/cargo/manifest/TEST-E2E-01`);
  const final = await res.json();
  console.log('tamper_detected:', final.tamper_detected);
  console.log('tamper_alerts:', final.tamper_alerts?.length, 'alert(s)');
  console.log(JSON.stringify(final, null, 2));
}

run().catch(console.error);
