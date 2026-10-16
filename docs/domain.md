# Domain Model

## Entities & Attributes

- List: A container for grouping related tasks. Can have a parent-child hierarchy (nested lists).

- Tag: A label for categorizing tasks semantically. Can have parent-child relationships for hierarchical tags.

- Todo: The fundamental unit of work. Represents a single action or item that needs to be done.

- Context: A saved, reusable query. Allows users to save complex search criteria

- Recurring Todo: A task that repeats according to `recur`

- Status: The lifecycle state of a task (Backlog, Todo, OnGoing, InReview, Done, Canceled)

- Report: The module for generating historical analytics

### Todo Entity

- `id`: integer(autoIncrement)
- `name`: string
- `description`: string
- `status`: enum ("Backlog", "Todo", "OnGoing", "InReview", "Done", "Canceled")
- `listId`: Reference to parent List, integer
- `tagIds`: Array of Tag IDs, integer[]
- `depends`: Array of dependent Todo IDs, integer[]
- `dueAt`: integer(timestamp)
- `scheduledAt`: integer(timestamp)
- `waitAt`: integer(timestamp)
- `priority`: A user-defined numeric score (-10,10)
- `estimate`: Estimated duration in minutes, integer
- `recur`: RRULE json
- `parent`: Reference to recur Todo that created this Todo ID, integer
- `doneAt`: integer(timestamp)

#### RRULE

- `frequency`: enum("Yearly","Monthly","Weekly","Daily","Hourly","Minutely","Secondly")
- `dtstart`: The recurrence start, integer(timestamp)
- `interval`: integer > 0
- `count`: integer > 0, can not use with `until`
- `until`: integer(timestamp), can not use with `count`

### List Entity

- `id`: integer(autoIncrement)
- `name`: string
- `parentId`: For nested lists, integer
- `isArchive`: mark as archive to ignore by list in default

### Tag Entity

- `id`: integer(autoIncrement)
- `name`: string
- `parentId`: For hierarchical tags

### Context Entity (Conceptual)

- `id`: integer(autoIncrement)
- `name`: string
- `query`: JSON-encoded query object

## Operations & Interfaces (Conceptual)

### Todo Operations

- `create(todoData)`: Creates new task
- `query(filter, group, sort)`: Query
- `update(filter, todoData.partial)`: Updates tasks matching filter, update all if filter not given
- `delete(filter)`: Removes task matching filter, delete all if filter not given
- `toggle(id, status)`: toggle status

### Context Operations

- `save(name, query)`: Persists a query
- `load(contextId)`: Retrieves saved query
- `list()`: Returns all saved queries

### List & Tag Operations

- `createList(name, parentId?)`
- `createTag(name, parentId?)`
- `list(option)`: Return all Lists / Tags

### Report Operations (Conceptual)

- `generateReport(options)`: Computes analytics for given time range
