try {

    if (process.argv.length <= 2) {
        console.log('No argument passed');
        process.exit(2);
    }

    const Url = require('url');
    const url = process.argv[2];
    const parsed = Url.parse(url, true);    
    const credentials = {
        username: parsed.auth.split(':')[0],
        password: parsed.auth.split(':')[1],
    };

    const database = parsed.pathname.startsWith('/') ? parsed.pathname.substring(1) : parsed.pathname;
    const connection = ((_) => {
        if (_.endsWith(':')) {
            _ = _.substring(0, _.length - 1);
        }
        switch (_) {
            case 'postgres': return 'pg';
            case 'mysql':
            case 'mariadb': return 'mysql';
            default: return 'pg';
        }
    })(parsed.protocol);

    console.log('DB_CONNECTION=' + connection);
    console.log('DB_DATABASE=' + database);
    console.log('DB_HOST=' + parsed.hostname);
    console.log('DB_PASSWORD=' + credentials.password);
    if (parsed.port)
        console.log('DB_PORT=' + parsed.port);
    console.log('DB_SSL=' + 'true'); // TODO: fix this
    console.log('DB_USER=' + credentials.username);
} catch (err) {
    console.error(err);
    process.exit(1);
}