# Python Technical Reference

## Memory Management and GIL
CPython manages memory using reference counting and a generational garbage collector for cyclic references. The Global Interpreter Lock (GIL) enforces single-threaded execution of Python bytecode, making CPU-bound tasks rely on multiprocessing or C extensions for true parallelism.

## Decorators, Generators, and Context Managers
Decorators wrap functions or classes to modify behavior dynamically using higher-order functions. Generators yield values lazily using `yield`, saving memory on large sequences. Context managers (`with` statement) manage setup and teardown using `__enter__` and `__exit__`.

## Data Structures and Typing
Python provides built-in mutable structures (list, dict, set) and immutable structures (tuple, frozenset). Dicts use hash tables with $O(1)$ average lookup time. Type hints (`typing` module) improve code clarity and static analysis via tools like Mypy.

## Virtual Environments and Package Management
Isolated virtual environments (`venv`, `conda`) manage project dependencies without global namespace conflicts. Package dependencies are listed in `requirements.txt` or `pyproject.toml` and installed via `pip`.
