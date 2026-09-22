# MongoDB Technical Reference

## Document Data Model and BSON
MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON (Binary JSON) format. Fields can vary across documents within a collection, supporting nested sub-documents and arrays without mandatory rigid schemas.

## Indexing and Query Performance
Single-field, compound, text, and geospatial indexes accelerate query execution using Btree structures. Compound index field ordering matters (ESR rule: Equality, Sort, Range). `explain("executionStats")` analyzes query execution plans and index utilization.

## Aggregation Framework
MongoDB Aggregation Pipeline processes documents in multi-stage sequences (`$match`, `$project`, `$group`, `$lookup`, `$unwind`, `$sort`). `$lookup` performs left outer joins across collections, while `$group` computes summary statistics and aggregations.

## Replica Sets and Sharding
Replica sets provide high availability and automatic failover through primary-secondary node replication. Sharding distributes data horizontally across multiple shard servers using shard keys to scale read/write throughput and storage capacity.
