/*global openDatabase*/
/**/
/**
 * InsomniacByChoice Javascript database active record driver
 *   @contributors:       „
 *       Matthew Potter c|_| (with heavy CodeIgniter / EllisLab, Inc. influence)
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

(function () {
    "use strict"; // Because we're doing things right from the start ¬L¬`

    Insomniacbychoice.database = function () {

        var self = this;

        this.connection     = null;
        this.dbConnected    = false;
        this.shortName      = 'ibc';
        this.version        = '1.0';
        this.name           = 'insomniacbychoice';
        this.maxSize        = (1024 * 5);
        this.result         = [];
        this.insertId       = null;
        this.rowsEffected   = 0;

        // Active record variables
        this.ar_select      = [];
        this.ar_select_esc  = [];
        this.ar_distict     = false;
        this.ar_from        = [];
        this.ar_join        = [];
        this.ar_where       = [];
        this.ar_whereIn     = [];
        this.ar_like        = [];
        this.ar_groupBy     = [];
        this.ar_having      = [];
        this.ar_offset      = false;
        this.ar_limit       = false;
        this.ar_order       = false;
        this.ar_orderBy     = [];
        this.ar_set         = null;
        this.ar_bindVars    = [];

        this.callbacks      = {
            onSuccess   : function () {},
            onError     : function () {}
        };

        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            /***!Initialize
             * Automatically initiates the database connection and any
             * supplied variables.
             */
            initialize : function () {
                if (openDatabase) {

                    // Set the database connection (should do a check for browser compatibility)
                    self.connection = openDatabase(self.shortName, self.version, self.name, self.maxSize);

                    // Confirm the database has been connected
                    self.dbConnected = true;

                    return true;

                }
            },

            error : function (errorCode, messageStr) {

                errorCode = errorCode || 0;
                messageStr = messageStr || 'Unknown Error';

                throw new Error('Database Error ' + errorCode + ': ' + messageStr);


            },

            /***!Active Record Reset Active Record Values
             * Resets the default active record values in preparation
             * for the next query
             */
            reset : function () {
                self.ar_select      = [];
                self.ar_select_esc  = [];
                self.ar_distict     = false;
                self.ar_from        = [];
                self.ar_join        = [];
                self.ar_where       = [];
                self.ar_whereIn     = [];
                self.ar_like        = [];
                self.ar_groupBy     = [];
                self.ar_having      = [];
                self.ar_offset      = false;
                self.ar_limit       = false;
                self.ar_order       = false;
                self.ar_orderBy     = [];
                self.ar_set         = null;
                self.ar_bindVars    = [];
            },

            /***!Active Record Protect Identifiers
             * To ensure that all column identifiers are protected,
             * this private function is run for every column request
             * throughout the active record object.
             * @param    (str)    item             Identifier to protect
             * @return    (bool)  override_protect (Optional) to overide protection
             */
            protect_identifiers : function (item, override_protect) {

                var i,
                    escaped_array = [];

                // Set default value for provided argument
                item = item || null;
                override_protect = override_protect || false;

                // Throw an error if the item wasn't provided
                if (!item) {
                    self.error(159, 'Invalid identifier and cannot protect');
                }

                // Override the protection if requested
                if (override_protect) {
                    return item;
                }

                // If the provided item is an array, return protected array values
                if (typeof item === 'object') {
                    for (i in item) {
                        if (item.hasOwnProperty(i)) {
                            escaped_array[i] = self.protect_identifiers(item[i]);
                        }
                    }

                    return escaped_array;
                }

                // Replace all multiple spaces and tabs with a single space
                item = item.replace(/[\t ]+/gi, ' ');

                // Any MIN or MAX values are ignored and the items is returned
                if (item.indexOf('(') !== -1) {
                    return item;
                }

                // Escape the supplied identifier
                return self.escape_identifiers(item);

            },

            /***!Active Record Escape Identifiers
             * Adds the containing backticks to contain the field names
             * and the table names.
             * @param	(str)	identifier   Identifier to escape
             */
            escape_identifiers : function (identifier) {

                // Set the default value for the provided arguments
                identifier = identifier || null;

                // Graciously exit on no column provided
                if (identifier) {
                    return null;
                }

                // Remove any existing backticks from the string
                identifier = identifier.replace('`', '');

                // Replace any divider characters to the backticks and the divider
                if (identifier.indexOf('.') !== -1) {
                    identifier = identifier.replace('.', '`.`');
                }

                // Return the identifier with surrounding backticks
                return '`' + identifier + '`';

            },
            /***!Escape
             * Depending on the supplied argument's type, escape the
             * value pertaining to the appropriate method.
             * @param	(mixed)    escapeVal   Value(s) to escape
             */
            escape : function (escapeVal) {

                // String values will be contained with single quotes
                if (typeof escapeVal === 'string') {
                    return "'" + self.escapeStr(escapeVal) + "'";
                }

                // Booleans will convert to binary values
                if (typeof escapeVal === 'boolean') {
                    return (escapeVal) ? 1 : 0;
                }

                // Null objects will be converted into a flat, unescaped SQL null
                if (escapeVal === null) {
                    return 'NULL';
                }

                // ALl other values (floats, numbers, integers…) will remain unchanged
                return escapeVal;
            },

            /***!Escape Strings
             *
             * Because strings can contain special characters, we need
             * to escape those prior to creating the query.
             *
             * @access	public
             * @param	string	String value to escape
             * @param	boolean	Whether the string is for a LIKE query
             * @return	mixed
             */
            escapeStr : function (str, like) {

                // Capture the required variables
                str		= str || null;
                like	= like || false;

                // Return the same value if supplied is null
                if (!str) {
                    return str;
                }

                var s;

                // If supplied value is an array of objects, run on each
                if (typeof str === 'object') {
                    for (s in str) {
                        if (str.hasOwnProperty(s)) {
                            str[s] = self.escapeStr(str, like);
                        }
                    }
                    return str;
                }

                // Run the custom escape function on the provided string
                str = self.mysql_real_escape_string(str);

                // Ensure safe LIKE values
                if (like) {
                    str.replace(['%', '_'], ['\\%', '\\_']);
                }

                return str;

            },

            /***!MYSQL Real Escape
             * Because there is no built in way to escape a string via
             * javascript in preparations for SQL, this uses the same
             * method that the PHP's built in function of the same name
             * uses to escape string (supposedly).
             * @param	(str) str	String value to escape
             */
            mysql_real_escape_string : function (str) {
                str = str || '';
                return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
                    switch (char) {
                    case "\x08":
                        return "\\b";
                    case "\x09":
                        return "\\t";
                    case "\x1a":
                        return "\\z";
                    case "\n":
                        return "\\n";
                    case "\r":
                        return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%":
                        return "\\" + char;
                    }
                });

            },

            /***!Select
             * Adds supplied select variables to the active record array
             * @param    (str || arr) selectVal     The column names to select as an array or single string
             * @return    object
             */
            select : function (selectVal, escaped) {

                var i;

                // Capture the required variables
                selectVal   = selectVal || '*';
                escaped     = escaped || false;

                // Split any string into it's appropriate variables
                if (typeof selectVal === 'string') {
                    selectVal = selectVal.split(',');
                }

                // Now that the input is an object, loop
                for (i = 0; i < selectVal.length; i = i + 1) {

                    // Remove white spaces
                    selectVal[i] = selectVal[i].trim();

                    // Save the variable and to escape to active record
                    if (selectVal[i] !== '') {
                        self.ar_select.push(selectVal[i]);
                        self.ar_select_esc.push(escaped);
                    }

                }

                return self;

            },

            /***!Query
             * Using the provided string, queries the database and
             * returns the result into the database result array.
             *  @param    string        An SQL Query
             *  @param    array        Variable data for binding
             *  @param    function    Success Callback
             *  @param    function    Error Callback
             *  @return    mixed
             */
            query : function (queryStr, queryVars, successCallback, errorCallback) {

                // Capture the required variables
                queryStr        = queryStr            || null;
                queryVars        = queryVars            || [];
                successCallback    = successCallback    || null;
                errorCallback    = errorCallback        || null;

                // Throw an error if there is no provided query to run
                if (!queryStr || queryStr === '') {
                    // throw new self.error(101, 'No query provided.', 'Database');

                    self.error(155, 'No query provided');

                }

                // If only one variable is provided, change the variables into an array
                if (typeof queryVars !== 'object') {
                    queryVars = [queryVars];
                }

                // Set any custom callbacks if provided
                self.callbacks.onSuccess = successCallback || null;
                self.callbacks.onError = errorCallback || null;

                // Reset the active records variables for the next call
                self.reset();

                // Insomniacbychoice.dispatchEvent('beforeQuery', {query: queryStr, variables: queryVars});

                // Begin the database transaction
                self.connection.transaction(function (SQLTransaction) {

                    // Run the query using the provided query string and variables along with a standard success callback
                    SQLTransaction.executeSql(queryStr, queryVars, function (SQLTransaction, results) {

                        var i;

                        // Save the count of the effected rows to the active record
                        self.rowsAffected = results.rowsAffected;

                        // Save the insertID where applicable
                        self.insertId = (results.rowsAffected > 0) ? results.insertId : null;

                        // Reset the result
                        self.result = [];

                        // Save each of the resulting rows into the driver's result array
                        for (i = 0; i < results.rows.length; i = i + 1) {
                            self.result.push(results.rows.item(i));
                        }

                        // Run any callback that was provided
                        if (self.callbacks.onSuccess) {
                            self.callbacks.onSuccess(SQLTransaction, results);
                        }


                    }, function (sqlTransaction, sqlError) {

                        // Throw custom callback if set prior to the standard error, return false if error not required
                        if (self.callbacks.onError) {
                            self.callbacks.onError(sqlTransaction, sqlError);
                        }

                    });
                });

            },

            /***!From
             * Appends the table to the active record
             * @param    (str)  tableName   The table to perform the query of
             * @return    (obj)
             */
            from : function (tableName) {

                // Set default value for provided argument
                tableName = tableName || null;

                // Throw an error if the table name is invalid
                if (typeof tableName !== 'string' || tableName.trim() === '') {

                    self.error(153, 'No table name provided');

                    return;
                }

                // Simply add trimmed table name to the table record
                self.ar_from.push(tableName.trim());

                return self;

            },

            /***!Join
             * Appends the join condition to the active record
             * @param    (str)   table   The table name to join
             * @param    (str)   cond    Condition to match between tables
             * @param    (str)   type    (Optional) Type of join to perform
             */
            join : function (table, cond, type) {

                var joinString = '',
                    conditionArgs;

                // Set default values for provided arguments
                table   = table || null;
                cond    = cond  || null;
                type    = type  || null;

                // Throw error for incomplete join statements
                if (arguments.length <= 1) {
                    self.error(156, 'Join statement needs at least 2 variables');
                }

                // Reset the type of the join to match common formatting
                switch (type.toUpperCase()) {
                case 'LEFT':
                case 'RIGHT':
                case 'OUTER':
                case 'INNER':
                case 'LEFT OUTER':
                case 'RIGHT OUTER':
                    type = type.toUpperCase() + ' ';
                    break;
                default:
                    type = '';
                }

                // Split the condition up into it's components
                conditionArgs = cond.split(new RegExp(/([\w\W]+)([\W\s]+)(\w\W+)/));

                // Protect the arguments only, not the conditional
                cond = self.protect_identifiers(conditionArgs[0]) + conditionArgs[1] + self.protect_identifiers(conditionArgs[2]);

                // Compose the join string
                joinString += type + 'JOIN ' + self.protect_identifiers(table) + ' ON ' + cond;

                // Append the join condition to the active record
                self.ar_join.push(joinString);

                return self;
            },

            /***!Where
             * Appends a WHERE pairing to the active record using an
             * AND for seperation
             * @param	(str)  column  Column name
             * @param	(str)  value   Value to match
             */
            where : function (column, value) {

                // Set default values for provided arguments
                column  = column || null;
                value   = value  || null;

                return self.IBCwhere(column, value, 'AND ');

            },

            /***!Or Where
             * Appends a WHERE pairing to the active record using an
             * OR for seperation
             * @param	(str)	column   Column name
             * @param	(mixed)	value    Value to not match
             */
            or_where : function (column, value) {

                // Set default values for provided arguments
                column	= column	|| null;
                value	= value		|| null;

                return self.IBCwhere(column, value, 'OR ');

            },

            /***!Where In
             * Appends a WHERE pairing that uses an array for matching
             * and an AND for seperation
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             */
            where_in : function (column, value) {

                // Set default values for provided arguments
                column	= column	|| null;
                value	= value		|| null;

                return self.IBCwhere_in(column, value);
            },

            /***!Or Where In
             * Appends a WHERE pairing that uses an array for matching
             * and an OR for seperation
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             */
            or_where_in : function (column, value) {

                // Set default values for provided arguments
                column	= column	|| null;
                value	= value		|| null;

                return self.IBCwhere_in(column, value, false, 'OR ');
            },

            /***!Where Not In
             * Appends a WHERE pairing that uses an array for not
             * matching and an AND for seperation
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             */
            where_not_in : function (column, value) {

                // Set default values for provided arguments
                column	= column	|| null;
                value	= value		|| null;

                return self.IBCwhere_in(column, value, true);
            },

            /***!Or Where Not In
             * Appends a WHERE pairing that uses an array for not
             * matching and an OR for seperation
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             */
            or_where_not_in : function (column, value) {

                // Set default values for provided arguments
                column	= column	|| null;
                value	= value		|| null;

                return self.IBCwhere_in(column, value, true, 'OR ');
            },

            /***!Like
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             * @param	string	Side to allow variance
             */
            like : function (column, value, side) {

                // Set default values for provided arguments
                column		= column	|| null;
                value		= value		|| null;
                side		= side		|| 'both';

                return self.IBClike(column, value, 'AND ', side);
            },

            /***!Not Like
             * @param	string	Column name
             * @param	mixed	Value(s) to not match
             * @param	string	Side to allow variance
             */
            not_like : function (column, value, side) {

                // Set default values for provided arguments
                column		= column	|| null;
                value		= value		|| null;
                side		= side		|| 'both';

                return self.IBClike(column, value, 'AND ', side, false);
            },

            /***!Or Like
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             * @param	string	Side to allow variance
             */
            or_like : function (column, value, side) {

                // Set default values for provided arguments
                column		= column	|| null;
                value		= value		|| null;
                side		= side		|| 'both';

                return self.IBClike(column, value, 'OR ', side);
            },

            /***!Or Not Like
             * @param	string	Column name
             * @param	mixed	Value(s) to not match
             * @param	string	Side to allow variance
             */
            or_not_like : function (column, value, side) {

                // Set default values for provided arguments
                column		= column	|| null;
                value		= value		|| null;
                side		= side		|| 'both';

                return self.IBClike(column, value, 'OR ', side, false);
            },

            /***!Insert
             * Insert new record(s) into the database
             * @param	string		Table name
             * @param	object		Variables for the insert
             * @param	function	Callback function
             */
            insert : function (table, set, callback) {

                // Set default values for provided arguments
                table		= table || null;
                set			= set || null;
                callback	= callback || null;

                var sqlQuery = '';

                // Update the active records success callback if set
                if (callback) {
                    self.successCallback = callback;
                }

                // Add variables to the set if supplied
                if (set) {
                    self.set(set);
                }

                // Update the table if supplied
                if (table) {
                    self.from(table);
                }

                // Compile the SQL insert which also creates the binds
                sqlQuery += self.IBCcompile_insert();

                // Run the query
                this.query(sqlQuery, self.ar_bindVars);

                return self;
            },

            /***!Set
             * Create the variables for updating and inserting.
             * @param	mixed	Column to be updated or object of updates
             * @param	string	Value to set the column to
             */
            set : function (key, value) {

                // Set default values for provided arguments
                key		= key || null;
                value	= value || '';

                // Throw and error if nothing was provided
                if (!key) {
                    self.error(156, 'Missing variables');
                }

                // Setup the containing variable
                var keys = {},
                    k;

                // If set is a single column -> value change
                if (typeof key !== 'object') {
                    keys[key] = value;
                } else {
                    keys = key;
                }

                // If the active records variable is not an object, create it
                if (!self.ar_set) {
                    self.ar_set = [];
                }

                for (k in keys) {
                    if (keys.hasOwnProperty(k)) {
                        // Ensure we don't include the error that occurs when using the for loop
                        if (typeof keys[k] !== 'function') {
                            self.ar_set[k] = keys[k];
                        }
                    }
                }

                // If the count of items to set is 0, reset the set active record
                if (Object.keys(self.ar_set).length === 0) {
                    self.ar_set = null;
                }

                return self;
            },

            /***!Get
             * Composes the query string and executes it
             * @param	mixed		Table name or callback function
             * @param	function	Callback function
             */
            get : function (table, callback) {

                // Set default values for provided arguments
                table		= table || null;
                callback	= callback || null;

                var sqlQuery = '';

                if (typeof table === 'string') {
                    self.from(table);
                } else if (typeof table === 'function') {
                    self.callback = table;
                }

                if (callback) {
                    self.successCallback = callback;
                }

                sqlQuery += self.compile_select();

                // Run the query
                self.query(sqlQuery);

                return self;
            },

            /***!Active Record Where
             * Used by where() and or_where()
             * @param	(str)	Column name
             * @param	(str)	Value(s) to match
             * @param	(str)	(Optional) Type of where to add (AND or OR)
             */
            IBCwhere : function (column, value, type) {

                var prefix = '';

                // Set default values for provided arguments
                column  = column || null;
                value   = value  || null;
                type    = type   || 'AND ';

                // Throw an error if not enough variables are provided
                if (!column || !value) {
                    self.error(151, 'Missing where in variables');
                }

                // Always protect the column names
                column = self.protect_identifiers(column);

                // NULL values are not escaped and are handled different
                if (value === null) {
                    value = ' IS NULL';
                } else {
                    // Escape the value provided
                    value = ' = ' + self.escape(value);
                }

                // If active record is not empty, prepend the type
                prefix = (self.ar_where.length === 0) ? '' : type;

                // Add the statement to the list of active record wheres
                self.ar_where.push(prefix + column + value);

                return self;

            },

            /***!Active Record Where In
             * Used by where_in(), where_not_in(), or_where_in() and
             * or_where_not_in()
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             * @param	boolean	If where is a negative
             * @param	string	Type of where to add (AND or OR)
             */
            IBCwhere_in : function (column, value, not, type) {

                // Setup a containing variable for input values
                var values		= [],
                    v,
                    prefix,
                    whereIn;

                // Set default values for provided arguments
                column  = column  || null;
                value   = value   || null;
                not     = not     || false;
                type    = type    || 'AND ';

                // Throw an error if not enough variables are provided
                if (!column || !value) {
                    self.error(156, 'Missing variables');
                }

                // Change not variable to appropriate string value
                not = (not) ? ' NOT' : '';

                // If the value provided is not an array, add the single value
                if (typeof value !== 'object') {
                    values.push(value);
                } else {
                    // Add each of the values provided to the values array
                    for (v in value) {
                        if (value.hasOwnProperty(v)) {
                            values.push(value[v]);
                        }
                    }
                }

                // Add an escaped version of each of the values to the active record
                self.ar_whereIn.push(self.escape(values));

                // If active record is not empty, prepend the type
                prefix = (self.ar_where.length === 0) ? '' : type;

                // Compose the WHERE IN statement
                whereIn = prefix + self.protect_identifiers(column) + not + " IN (" + self.ar_whereIn.join(', ') + ") ";

                // Add the statement to the list of wheres
                self.ar_where.push(whereIn);

                // Clear the active record placeholder variable
                self.ar_whereIn = [];

                return self;

            },

            /***!Active Record Like
             * Used by like(), not_like(), or_Like(), or_not_like()
             * @param	string	Column name
             * @param	mixed	Value(s) to match
             * @param	string	Type of where to add (AND or OR)
             * @param	string	Side to allow variance
             * @param	boolean	If like is a negative
             */
            IBClike : function (column, match, type, side, not) {

                // Set default values for provided arguments
                column		= column	|| null;
                match		= match		|| '';
                type		= type		|| 'AND ';
                side		= side		|| 'both';
                not			= not		|| false;

                // Throw an error if not enough variables are provided
                if (!column || !match) {
                    self.error(156, 'Missing variables.');
                }

                // Setup a containing variable for input values
                var values = [],
                    prefix,
                    statement,
                    m,
                    v;

                // Change not variable to appropriate string value
                not = (not) ? ' NOT' : '';

                //If the match is not an array, add the single value
                if (typeof match !== 'object') {
                    values.push(match);
                } else {
                    // Add each of the matches provided to the values array
                    for (m in match) {
                        if (match.hasOwnProperty(m)) {
                            values.push(match[m]);
                        }
                    }
                }

                // Always protect the column names
                column = this.protech_identifiers(column);

                // Create a new like statement for each match
                for (v in values) {
                    if (values.hasOwnProperty(v)) {
                        // If the active record is not empty, prepend the type
                        prefix = (this.ar_like.length === 0) ? '' : type;

                        // Escape the current value using the LIKE variant
                        values[v] = self.escape_str(values[v], true);

                        // Begin composing the LIKE statement
                        statement = prefix + " " + column + " " + not + " LIKE '";

                        // Continue with the statement composing based upon the side
                        switch (side) {
                        case 'none':
                            statement +=  '{' + values[v] + '}';
                            break;
                        case 'before':
                            statement += '%{' + values[v] + '}';
                            break;
                        case 'after':
                            statement +=  '{' + values[v] + '}%';
                            break;
                        default:
                            statement += '%{' + values[v] + '}%';
                        }

                        // Complete the composing of the statement
                        statement += "'";

                        // Add the statement to the list of likes
                        self.ar_like.push(statement);
                    }
                }

                return self;

            },

            IBCfrom_tables : function () {

                if (self.ar_from.lenth === 0) {
                    self.error(501, 'You need to specify a table name');
                }

                var tableString = '(',
                    t;

                for (t = 0; t < self.ar_from.length; t = t + 1) {
                    tableString += self.protect_identifiers(self.ar_from[t]) + ', ';
                }

                return tableString.substr(0, tableString.length - 2) + ')';

            },

            IBCcompile_select : function (overrideSQL) {

                var sqlQuery = '',
                    s;

                overrideSQL = overrideSQL || null;

                if (overrideSQL) {
                    return overrideSQL;
                }

                sqlQuery += (self.ar_distict === true) ? 'SELECT DISTINCT ' : 'SELECT ';

                if (self.ar_select.length === 0) {
                    sqlQuery += '*';
                } else {
                    for (s in self.ar_select) {
                        if (self.ar_select.hasOwnProperty(s)) {
                            if (typeof self.ar_select[s] !== 'function') {
                                sqlQuery += self.protect_identifiers(self.ar_select[s], self.ar_select_esc[s]) + ', ';
                            }
                        }
                    }

                    sqlQuery = sqlQuery.substr(0, sqlQuery.length - 2);

                }

                sqlQuery += "\nFROM " + self.IBCfrom_tables();

                if (self.ar_join.length !== 0) {
                    sqlQuery += "\n" + self.ar_join.join("\n");
                }

                if (self.ar_where.length !== 0) {
                    sqlQuery += "\nWHERE " + self.ar_where.join("\n");
                }

                if (self.ar_like.length !== 0) {

                    if (self.ar_where.length !== 0) {
                        sqlQuery += "\nAND ";
                    }

                    sqlQuery += self.ar_like.join("\n");
                }

                if (self.ar_groupBy.length !== 0) {
                    sqlQuery += "\nGROUP BY " + self.ar_groupBy.join(", ");
                }

                if (self.ar_having.length !== 0) {
                    sqlQuery += "HAVING " + self.ar_having.join(", ");
                }

                // TODO: Add Order By

                // TODO: Add Limit

                return sqlQuery;

            },

            /***!Active Record Compile Insert
             * Use the existing active record values to built the
             * insert query.
             */
            IBCcompile_insert : function () {

                // Throw an error if there is incomplete data required
                if (Object.keys(self.ar_set).length === 0) {
                    self.error(153, 'You need to set variables before inserting.', 'Database');
                }
                if (self.ar_from.length === 0 || self.ar_from[0] === '') {
                    self.error(501, 'You need to specify a table name');
                }

                // Create the various objects required for building
                var columns = '',
                    values = '',
                    c;

                self.ar_bindVars = [];

                // Loop over existing set variables
                for (c in self.ar_set) {
                    if (self.ar_set.hasOwnProperty(c)) {
                        // Ensure we don't include the error that occurs when using the for loop
                        if (self.ar_set[c] && typeof self.ar_set[c] !== 'function') {

                            // Protect the column name
                            columns		+= self.protect_identifiers(c) + ', ';

                            // Place the bind character
                            values		+= '?, ';

                            // Save the variable to the bind variable
                            self.ar_bindVars.push(self.ar_set[c]);
                        }
                    }
                }

                // Clean-up the two string variables
                columns	= columns.substr(0, columns.length - 2);
                values	= values.substr(0, values.length - 2);

                // Compose and return the insert query
                return "INSERT INTO " + self.protect_identifiers(self.ar_from[0]) + " (" + columns + ") VALUES (" + values + ")";

            }

        };

        Insomniacbychoice.database = new Insomniacbychoice.database();

    };

}());