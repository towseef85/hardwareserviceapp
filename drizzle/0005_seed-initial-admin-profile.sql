DO $$
DECLARE
    admin_auth_user_id text;
    admin_store_id integer;
BEGIN
    /*
      Find the Better Auth administrator.
      We use email and username so we do not hard-code the generated Auth ID.
    */
    SELECT id
    INTO admin_auth_user_id
    FROM "user"
    WHERE lower(email) = lower('admin@example.com')
      AND lower(username) = lower('admin')
    LIMIT 1;

    IF admin_auth_user_id IS NULL THEN
        RAISE NOTICE
            'Better Auth administrator admin@example.com was not found. Application profile was not created.';

        RETURN;
    END IF;

    /*
      Choose the administrator Store.

      Change STR-RUH-01 if the administrator should belong
      to another Store.
    */
    SELECT id
    INTO admin_store_id
    FROM stores
    WHERE code = 'STR-RUH-01'
    LIMIT 1;

    IF admin_store_id IS NULL THEN
        RAISE EXCEPTION
            'Store STR-RUH-01 was not found. Cannot create the administrator application profile.';
    END IF;

    /*
      Insert the application profile only when it does not exist.
    */
    INSERT INTO app_users
    (
        full_name,
        contact,
        email,
        username,
        store_id,
        auth_user_id,
        is_active,
        created_at,
        updated_at
    )
    SELECT
        'System Administrator',
        NULL,
        'admin@example.com',
        'admin',
        admin_store_id,
        admin_auth_user_id,
        TRUE,
        NOW(),
        NOW()
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM app_users
        WHERE lower(username) = lower('admin')
           OR lower(email) = lower('admin@example.com')
           OR auth_user_id = admin_auth_user_id
    );

    /*
      Repair an existing profile that was created without the Auth link.
    */
    UPDATE app_users
    SET
        full_name = 'System Administrator',
        email = 'admin@example.com',
        username = 'admin',
        auth_user_id = admin_auth_user_id,
        is_active = TRUE,
        updated_at = NOW()
    WHERE
        lower(username) = lower('admin')
        OR lower(email) = lower('admin@example.com')
        OR auth_user_id = admin_auth_user_id;

    /*
      Ensure the Better Auth account has the admin role.
    */
    UPDATE "user"
    SET role = 'admin'
    WHERE id = admin_auth_user_id;
END
$$;