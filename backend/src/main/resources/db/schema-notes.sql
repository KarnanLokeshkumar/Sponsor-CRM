-- Optional starter schema notes.
-- JPA entities/repositories will create/update tables as modules are implemented.
-- No billing, invoice, payment, or transaction tables are included.

CREATE TABLE IF NOT EXISTS sponsor_crm_notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_text VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
