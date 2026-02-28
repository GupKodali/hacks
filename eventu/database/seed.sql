TRUNCATE 
event_attendees,
event_tags,
user_tags,
user_availability,
events,
users,
tags
RESTART IDENTITY CASCADE;

INSERT INTO users (user_id) VALUES
('test_user_1'),
('test_user_2'),
('test_user_3'),
('test_user_4'),
('test_user_5'),
('test_user_6'),
('test_user_7'),
('test_user_8'),
('test_user_9'),
('test_user_10');

INSERT INTO tags (name) VALUES
('sports'),
('music'),
('study');

INSERT INTO user_tags (user_id, tag_id)
VALUES
('test_user_1', 1),
('test_user_1', 2),
('test_user_2', 1),
('test_user_3', 3),
('test_user_4', 2),
('test_user_5', 1),
('test_user_6', 3),
('test_user_7', 2),
('test_user_8', 1),
('test_user_9', 2),
('test_user_10', 3);

INSERT INTO events (name, start_time, end_time, location, description, max_attendees, min_attendees)
VALUES
('Basketball Night', '2026-03-02 18:00', '2026-03-02 20:00', 'Gym', 'Pickup basketball', 10, 4),
('Study Group', '2026-03-03 14:00', '2026-03-03 16:00', 'Library', 'Calculus review', 6, 2),
('Music Jam', '2026-03-02 19:00', '2026-03-02 21:00', 'Music Room', 'Jam session for all skill levels', 8, 2);

INSERT INTO event_tags (event_id, tag_id)
VALUES
(1, 1), -- Basketball Night → sports
(2, 3), -- Study Group → study
(3, 2); -- Music Jam → music

INSERT INTO user_availability (user_id, start_time, end_time) VALUES
('test_user_1', '2026-03-02 17:00', '2026-03-02 21:00'), -- fully covers event 1 & 3
('test_user_2', '2026-03-02 18:00', '2026-03-02 20:00'), -- fully covers event 1
('test_user_3', '2026-03-03 14:00', '2026-03-03 16:00'), -- fully covers event 2
('test_user_4', '2026-03-02 17:30', '2026-03-02 19:30'), -- partially covers event 1 (only 18-19:30), exclude from event
('test_user_5', '2026-03-03 14:00', '2026-03-03 16:00'), -- fully covers event 2
('test_user_6', '2026-03-02 19:00', '2026-03-02 21:00'), -- fully covers event 3
('test_user_7', '2026-03-03 15:00', '2026-03-03 17:00'), -- partially covers event 2 (15-16:00), exclude from event
('test_user_8', '2026-03-02 18:00', '2026-03-02 20:00'), -- fully covers event 1
('test_user_9', '2026-03-03 14:30', '2026-03-03 16:30'), -- fully covers event 2
('test_user_10', '2026-03-02 19:30', '2026-03-02 21:00'); -- fully covers event 3

INSERT INTO event_attendees (event_id, user_id)
VALUES
-- Event 1: Basketball Night (18:00-20:00)
(1, 'test_user_1'),
(1, 'test_user_2'),
(1, 'test_user_8'),

-- Event 2: Study Group (14:00-16:00)
(2, 'test_user_3'),
(2, 'test_user_5'),
(2, 'test_user_9'),

-- Event 3: Music Jam (19:00-21:00)
(3, 'test_user_1'),
(3, 'test_user_6'),
(3, 'test_user_10');