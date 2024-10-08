INSERT INTO user (username, password)
VALUES
    ('test', 'pbkdf2:sha256:50000$TCI4GzcX$0de171a4f4dac32e3364c7ddc7c14f3e2fa61f2d17574483f7ffbb431b4acb2f'),
    ('other', 'pbkdf2:sha256:50000$kJPKsz6N$d2d4784f1b030a9761f5ccaeeaca413f27f2ecb76d6168407af962ddce849f79');

INSERT INTO schedule (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
VALUES
    (1, "LST", "COL", "SRA", unixepoch("2024-09-22 14:00"), unixepoch("2024-09-22 14:40"), unixepoch("2024-09-22 14:10"), 0),
    (2, "COL", "SRA", "LST", unixepoch("2024-09-22 14:00"), unixepoch("2024-09-22 14:40"), unixepoch("2024-09-22 14:10"), 0);