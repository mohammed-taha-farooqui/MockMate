# JavaScript Technical Reference

## Event Loop and Concurrency
JavaScript operates on a single-threaded event loop architecture using a call stack, task queue (macrotasks), and microtask queue. Asynchronous callbacks such as Promises and process.nextTick are scheduled on the microtask queue, which is processed immediately after the current call stack clears and before rendering or Macrotask processing (setTimeout, setInterval).

## Closures and Lexical Scope
A closure is a function bundled together with references to its surrounding lexical environment. Closures allow inner functions to retain access to variables defined in an enclosing scope even after the outer function has finished executing. Common use cases include data privacy, factory functions, and event handlers.

## Prototypes and Inheritance
Objects in JavaScript inherit properties and methods through a prototype chain. Every JavaScript object has an internal `[[Prototype]]` link. ES6 `class` syntax is syntactic sugar over prototype-based inheritance (`Object.create`, `Constructor.prototype`).

## Asynchronous Control Flow
Promises represent the eventual completion or failure of an asynchronous operation. `async/await` syntax allows writing asynchronous code sequentially. Unhandled promise rejections can crash Node.js processes or produce browser warnings.
