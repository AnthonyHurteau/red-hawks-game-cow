const delay = parseInt(process.argv[2], 10) || 5000;

setTimeout(() => {
    process.exit(0);
}, delay);
