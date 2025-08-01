/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {pgm.sql(`
-- 1. Add Unique Constraints  
ALTER TABLE public.users   
ADD CONSTRAINT unique_username UNIQUE (username);  

ALTER TABLE public.users   
ADD CONSTRAINT unique_email UNIQUE (email);  

-- 2. Add Length Constraints  
ALTER TABLE public.users   
ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50);  

ALTER TABLE public.users   
ADD CONSTRAINT password_length CHECK (char_length(password) >= 8);
    `)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
