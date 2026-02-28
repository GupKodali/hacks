-- USERS
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT
);

-- EVENTS
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT,
    description TEXT,
    max_attendees INT,
    min_attendees INT,
    CHECK (start_time < end_time)
);

-- AVAILABILITY
CREATE TABLE user_availability (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CHECK (start_time < end_time)
);

-- TAGS
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- EVENT TAGS
CREATE TABLE event_tags (
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- USER TAGS
CREATE TABLE user_tags (
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

-- EVENT ATTENDEES
CREATE TABLE event_attendees (
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- INDEXES
CREATE INDEX idx_availability_time
ON user_availability (start_time, end_time);

CREATE INDEX idx_event_time
ON events (start_time, end_time);