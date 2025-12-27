const net = require('net');

const tests = [
    { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, name: 'AWS-0 Mumbai Pooler (6543)' },
    { host: 'aws-1-ap-south-1.pooler.supabase.com', port: 6543, name: 'AWS-1 Mumbai Pooler (6543)' } // Checking alternate pooler host
];

tests.forEach(test => {
    const client = new net.Socket();
    client.setTimeout(5000);

    console.log(`Testing ${test.name}...`);

    client.connect(test.port, test.host, function () {
        console.log(`✅ SUCCESS: Connected to ${test.name}`);
        client.destroy();
    });

    client.on('error', function (err) {
        console.log(`❌ FAILED: ${test.name} - ${err.message}`);
    });

    client.on('timeout', function () {
        console.log(`❌ TIMEOUT: ${test.name}`);
        client.destroy();
    });
});
