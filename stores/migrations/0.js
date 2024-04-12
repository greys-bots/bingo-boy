// adds current iteration to boards

module.exports = async (bot, db) => {
	var columns = await db.query(`
		select column_name from information_schema.columns
		where table_name = 'boards'`);
	if(columns.rows?.[0] && columns.rows.find(x => x.column_name == 'current')) return;

	await db.query(`
		ALTER TABLE boards ADD COLUMN current TEXT;
	`);

	return;
}
