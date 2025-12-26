import { RowDataPacket } from 'mysql2/promise';

export interface DatabaseRow extends RowDataPacket {
    SCHEMA_NAME: string;
}

export interface ColumnRow extends RowDataPacket {
    TABLE_NAME: string;
    column_name: string;
    column_type: string;
    collation_name: string;
    is_nullable: string;
    TABLE_SCHEMA: string;
}

export interface TableRow extends RowDataPacket {
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
}