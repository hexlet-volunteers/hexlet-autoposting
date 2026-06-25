#!/bin/sh

echo "host replication all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
