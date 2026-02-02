# Graft: Interactive Graph Theory Sandbox

A Desmos-style tool for building and exploring graphs. Click to add vertices, drag to create edges, and instantly see graph properties update as you work.

## Why it's needed

- Existing graph tools are either clunky (GraphOnline), code-heavy (NetworkX), or built for network visualization rather than discrete math
- Students and researchers need a frictionless way to test constructions, explore counterexamples, and visualize graph properties
- No good alternative for quickly prototyping graph-theoretic ideas

## Core features

- Intuitive visual interface—build graphs by clicking and dragging
- Live property computation (degree sequences, connectivity, bipartiteness, chromatic number, etc.)
- Library of famous graphs (Petersen, complete graphs, cycles)
- Export as set notation, adjacency matrix, or LaTeX TikZ code
- Shareable links for collaboration or teaching

## Use cases

- **Students:** test homework constructions before proving
- **Instructors:** create interactive lecture examples
- **Researchers:** rapidly prototype conjectures and find counterexamples
- Reduces cognitive overhead of mental visualization, freeing bandwidth for mathematical reasoning

## Tech

Vanilla JS + SVG. Zero-friction web app—no installation, no signup, just open and build.

## Pitch

As I worked through graph theory assignments and explored combinatorial constructions, I found myself constantly sketching graphs on scraps of paper or in the margins of my notebook. I would connect vertices, test edges, and try to track properties like degree sequences, connectivity, or bipartiteness — all while juggling the mental bookkeeping of which constructions were valid or potentially insightful. The process was repetitive and cognitively heavy, and I realized that much of my energy was going into visualization rather than mathematical reasoning.

This frustration inspired Graft, an interactive, Desmos-style sandbox for building and exploring graphs. In Graft, I can add vertices with a click, drag to form edges, and instantly see graph properties update as I work. Famous graphs like the Petersen graph or complete graphs are included, and every construction can be exported as set notation, adjacency matrix, or LaTeX TikZ code — making it useful for both research and teaching.

What excites me most is how Graft bridges intuition and formal reasoning. By reducing the cognitive overhead of tracking vertices and edges manually, it frees me to focus on exploring conjectures, testing counterexamples, and gaining deeper insight into the structure of graphs. Whether I’m a student checking homework constructions, an instructor preparing an interactive lecture, or a researcher prototyping new conjectures, Graft makes experimentation seamless and immediate.

The tool is deliberately lightweight — built with vanilla JavaScript and SVG, it requires no installation or signup, just open the browser and start constructing. In a field where visualization often dictates understanding, Graft transforms exploration from a bottleneck into a platform for discovery.