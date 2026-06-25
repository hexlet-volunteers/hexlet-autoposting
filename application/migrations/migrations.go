package migrations

import "embed"

// FS содержит встроенные SQL-файлы миграций (*.up.sql / *.down.sql).
// Встраивание позволяет запускать миграции из собранного бинарника без
// доступа к исходной файловой системе.
//
//go:embed *.sql
var FS embed.FS
