import { defineRelations } from "drizzle-orm";

import { lists } from "#src/schema/lists.ts";
import { tags } from "#src/schema/tags.ts";
import { todoDepends, todos, todoTags } from "#src/schema/todos.ts";

const schema = { lists, tags, todos, todoDepends, todoTags };

export const relations = defineRelations(schema, (r) => ({
  lists: {
    parent: r.one.lists({
      alias: "parent",
      from: r.lists.parentId,
      to: r.lists.id,
    }),
    children: r.many.lists({
      alias: "children",
      from: r.lists.id,
      to: r.lists.parentId,
    }),
    todos: r.many.todos({
      from: r.lists.id,
      to: r.todos.listId,
    }),
  },
  tags: {
    parent: r.one.tags({
      alias: "parent",
      from: r.tags.parentId,
      to: r.tags.id,
    }),
    children: r.many.tags({
      alias: "children",
      from: r.tags.id,
      to: r.tags.parentId,
    }),
    todos: r.many.todos({
      from: r.tags.id.through(r.todoTags.tagId),
      to: r.todos.id.through(r.todoTags.todoId),
    }),
  },
  todos: {
    list: r.one.lists({
      from: r.todos.listId,
      to: r.lists.id,
    }),
    tags: r.many.tags({
      from: r.todos.id.through(r.todoTags.todoId),
      to: r.tags.id.through(r.todoTags.tagId),
    }),
    dependsOn: r.many.todos({
      alias: "dependsOn",
      from: r.todos.id.through(r.todoDepends.todoId),
      to: r.todos.id.through(r.todoDepends.dependsOnId),
    }),
    blocks: r.many.todos({
      alias: "blocks",
      from: r.todos.id.through(r.todoDepends.dependsOnId),
      to: r.todos.id.through(r.todoDepends.todoId),
    }),
  },
  todoTags: {
    todo: r.one.todos({
      from: r.todoTags.todoId,
      to: r.todos.id,
    }),
    tag: r.one.tags({
      from: r.todoTags.tagId,
      to: r.tags.id,
    }),
  },
  todoDepends: {
    todo: r.one.todos({
      alias: "todo",
      from: r.todoDepends.todoId,
      to: r.todos.id,
    }),
    dependsOn: r.one.todos({
      alias: "dependsOn",
      from: r.todoDepends.dependsOnId,
      to: r.todos.id,
    }),
  },
}));
