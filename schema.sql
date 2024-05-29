drop database if exists travel_tales;

create database travel_tales;

use travel_tales;

create table trips (
    tripID int not null auto_increment,
    title varchar(90),
    reason varchar(10),
    country varchar(30),
    city varchar(30),
    latitude int,
    longitude int,
    description text,
    primary key (tripID)
)