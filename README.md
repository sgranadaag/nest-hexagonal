# nest-hexagonal — pure hexagonal implementation

This repo is a pure implementation of a **hexagonal architecture**, following the standards and principles of **clean code**. The main purpose of this repository is to work as a template of a hexagonal implementation and to guide people through hexagonal concepts.

Following the documentation and the different theoretical approaches out there, it's easy to get confused, because hexagonal architecture breaks with many traditional architectures and concepts.

The repo is going to be branched into two initial implementations:

- **stable/monolith**: this branch will be a complete end-to-end (E2E) design of an example service connected to a Postgres DB.
- **stable/microservice**: this will be an implementation of three different microservices, each one following the hexagonal definition, using the same example as the monolith implementation.

---

## Technology

I decided to use **Nest** with **TypeScript** as the framework for this implementation, because Node is my main stack.

The idea with this repo, though, is to make it **agnostic of the stack selected** — the plan is to allow others to replicate this workflow and build their own implementation with any stack.

Nest offers us some tools that can ease our setup, such as:

- Middlewares
- Error handlers
- Dependency injection
- DB/ORM integrations

These help us manage all the setup required to develop a working application.

As I mentioned before, this is just **sugar** for our application — my focus is going to be inside the **kernel** of any software application (its domain and business rules). All the other parts should be supplied by any framework, ORM, language, and so on.

---

## Literature

First of all, we need to talk about hexagonal architecture, which is a software design that, depending on the author, could be interpreted and implemented in different ways.

This is my own representation based on many different documents — if you want to dive deeper into this, you can check:

- "Hexagonal Architecture" (alistair.cockburn.us/hexagonal-architecture)
- "Implementing Domain-Driven Design" by Vaughn Vernon (2013)
- "Clean Architecture" by Robert C. Martin (2017) — also known as "Uncle Bob"

> Also, I'm not the source of truth — feel free to read, research, and make your own implementation if you feel the need to.

---

## Architecture

This architecture is commonly represented as a circle of three layers, or wrapped by three different abstraction layers, in this order of importance and dependency:

| Layer | Contains | Responsibility |
| --- | --- | --- |
| **Domain** | Entities, Value Objects | Holds all the important information about the application |
| **Application** | Ports, Use Cases | Stores all the business rules |
| **Infrastructure** | Adapters | Manages all the interactions with external systems |

The main focus of this architecture is to **isolate the domain and business rules from the implementation concepts**, which allows us to grow our application in a very scalable way. If we need to make a change, we can go directly to what's affected and make the change there without affecting the other layers in any way.

We can also change one of the layers completely while preserving the other implementations. For example, imagine you decided to start your project with this implementation, but at some point you realize that TypeScript and Node are not the best framework selection for your project. In a traditional architecture, changing the framework or the language means, basically, redesigning everything.

With this architecture, we just need to migrate the domain and application layers and implement the new infrastructure rules and technologies. That way, we preserve the same initial design and business rules, and we just change how our app uses that kernel. **That's the power of a hexagonal implementation.**

But at the same time, we have some disadvantages: one of them is the complexity of understanding and implementing this kind of architecture. Frequently, the learning curve becomes steep at this point.

### Modules

#### Domain Layer

This is the most important layer in our application. The domain tells us:

- Who the entities involved in our application are
- How they communicate with each other
- How each entity or object is related and structured
- What kind of properties and fields it contains
- Why it's important to sustain that information

Following these requirements, I divided this layer into two sublayers, or subcomponents: **entities** and **value objects**.

The **entity** is the whole object itself — the representation and the means of the system. It contains the fields that represent information about the object.

The **value objects** are more complex fields with some specific characteristics:

- They can be replaced with another one, as long as it has the same data definition
- They cannot be modified after their creation
- They can only be compared by value — the reference of the object is not important at all

The importance of the domain layer is that it allows us to understand how our application is structured, what its purpose is, and its reason for existing — how everything is connected and related, and not just how, but also why it's related in a specific way. Basically, it contains all the important information about our application.

#### Application Layer

The application layer is the next layer that wraps the domain one; its function is to store all the business rules. I decided to divide it into two subsets: **ports** and **use cases**.

**Use cases** contain exactly the kind of operations we can execute over our domain — the domain is the structure, and the use cases work as its functionality: what I'm allowed to execute. They contain exactly the rules that our business requires for our system.

**Ports**, on the other hand, are basically interfaces or contracts that tell us how external systems or technologies can communicate with the domain. A port can be either **inbound** or **outbound**.

An example of an outbound port is the interface to interact with the DB or persistence layer. The power of this is that if I follow the same contract to manage specific operations over our domain, I can exchange between different DB engines without touching or changing anything related to the application or domain.

Suppose you decide to use Postgres as your DB engine — there you can find all the important operations over a DB, like read, create, and delete, etc. But at some point your business decides to migrate your data to another engine, maybe they wanted more flexibility, so they decide to migrate to Mongo.

In a traditional architecture, that kind of change would mean touching most of the parts of the application, including business rules (which are frequently coupled to the repositories and their implementations — queries, and things like that). With this architecture, you just need to migrate the data from Postgres to the new engine and adapt the operations to fulfill the contract, or port. That means not changing the domain, the business rules, or anything else — just the implementation itself.

So you can be sure the application will continue working as expected, since nothing related to the business rules changes, and you've successfully migrated your data. **That's the power of this.**

**Inbound ports**, on the other hand, refer to how the operations are executed over our application. Imagine you need to manage an application that requires interoperability — you need to be able to get information into our system through a REST API, gRPC, CLI... and you need to find a way to manage all of those entries; that's why inbound ports exist.

It's the same idea — basically a contract with all the operations allowed to be executed over our system (all the business operations allowed). You just need to ensure the external technologies match that contract, and that's it. You can manage many entries, executing operations over the same core, without touching or changing anything related to the domain (data and class structure) and the business rules (operations).

#### Infrastructure Layer

This is the most external layer of our architecture. It contains all the implementations — basically, its function is to manage the **adapters**.

The adapters are the other side of the coin when it comes to the ports: they're all the specific implementations that fulfill the contract defined by the ports. There we can find specific and directly related implementations, like a Postgres adapter, a Mongo adapter, a REST adapter... and so on.

The main function of this layer is to manage all the interactions with external systems. So, in case we need to change something inside our system related to specific implementations, or we need to migrate our DB engine, or maybe implement different ways to connect with our system — here is the only part we're going to need to change. The other parts of the system are going to preserve their code just like it was defined.

### Generic Modules

At this point, we have solved the main application structure — with this, the system would work completely, flowing from start to end of the app. But we can quickly face a problem: what happens with domains that don't follow a specific shape, or with domains that aren't too transparent, something really specific like a Book or Author entity?

In that case, it's important to ask some questions:

- Is the functionality modelable as an entity?
- Does the functionality contain, or can it be wrapped with, an identity?
- Does the functionality contain variants and business rules?
- Do we need to store the information somewhere in our DB?

If the answer to those questions is yes, it's clear we need to follow the same architecture definition (**domain/application/infrastructure**), because the functionality is still a business part. It's very important to follow good coding principles, understand exactly the responsibility of each part of the architecture, how the different layers communicate, and preserve its extensibility and decoupling.

In any other case, we can just implement the layers we require. For example, if we need to create some functionality to translate PDFs (stateless functionality), we can just create its infrastructure (adapter or external connections) and its application (use case — translate something), so in that case we can ignore the creation of a domain.

### Other Layers

By now, our application is completely designed — all the business capabilities were represented in our system, and we achieved all the business requirements. But we need to get all of this running, and at that moment another kind of question arises to solve.

For example, we might need to create:

- Migrations
- Utils
- Tests
- Middlewares
- Error handlers

All of those are things tied to the implementation (for this case, we are modeling a backend service), so in another case that kind of thing might not be important. But following this project, we need to find a way to organize all of those things, so I decided to create something like a layered architecture wrapping the hexagonal definition.

In that way, I created all of those layers as **transversal layers**, or **shared layers**. These should hold whatever is required for this specific backend service to work.

An important part there is trying not to tie any of the logic located there to any module directly — we aim to create functionalities or logic to manage the service's functionality, and use those tools around the application in general.

