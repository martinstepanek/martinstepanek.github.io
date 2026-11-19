# Make the wrong code impossible. How we set up our codebase for agents

By Martin Štěpánek (https://martinstepanek.github.io/), published 10 November 2026. Web version: https://martinstepanek.github.io/make-the-wrong-code-impossible/

Your agent copies your codebase. Give him a mess, and he will write more mess. Give him a clear pattern, and he will follow it.

And the code he writes is not for you. It is for the next agent, who will copy it again. Agents are the first-class citizens in your codebase now, not you.

In my previous article, [Start small, then let go. How to learn to trust AI agents](https://martinstepanek.github.io/start-small-then-let-go/), I wrote about how to start trusting your agents. I ended it with this: how far you can let go depends on the codebase too. What the agent can learn from it, what it checks for him, and how many agents can work in it at once. This article is about the first two. How many agents can work in it at once gets its own article.

## Fix it in the code first

Every time you find something bad in a PR, fix it in the PR. And then try to fix it structurally, so it won't happen again and you don't have to steer the agent again in the future. To find what to fix, ask the agent why he did it. Most of the time he copied an old pattern or followed a stale line in your docs, and that is what you fix.

I was doing this myself, but I did not know how to put it into words. Then I found [a post from Lauren Tan (@poteto)](https://x.com/poteto/status/2111133080526495985) and could not describe it better. So I borrowed her explanation.

Fix it as high in the pyramid below as you can. First the codebase. Then static analysis: lints, types, tests and CI. Then verification, like the agent testing his own work. Only after that prose: your CLAUDE.md, AGENTS.md or skills. And human review comes last.

![Lauren Tan's inverted pyramid: codebase (good API design, architecture, refactoring), static analysis (lints, types, compilers, tests, CI), verification (formal, empirical), prose (rules, skills, AGENTS.md), human review](https://martinstepanek.github.io/images/make-the-wrong-code-impossible/01-trust-pyramid-poteto-689.webp)

*Most of the effort goes at the top, the least at the bottom. Image: [Lauren Tan (@poteto)](https://x.com/poteto/status/2111133080526495985).*

Start at the top. The codebase has to be written so that the agent is not likely to implement something badly.

Some patterns are also more friendly to agents than they would be to humans. Matt Pocock is [debating banning useState](https://x.com/mattpocockuk/status/2115442777647726835) in React apps entirely. It limits what state the app can be in, and with fewer ways to do something, the agent writes good code more often.

When the codebase can't prevent a mistake, add deterministic checks that constrain the agent: more on those in the next section. And only when that is not fully possible, update your prose so it guides the agent the way you want.

The codebase always beats comments and documentation. Documentation and comments can quickly become stale and guide agents in the wrong direction. The codebase should always be the source of truth. Lauren goes as far as banning almost all comments. I am not sure about that and haven't done it yet, because I like having additional context around the code. But it might be a good move.

## CI gates

CI gates are deterministic checks that run on every PR. They either pass or fail. Ideally they are also fast and cheap: simple scripts and fast linters, not e2e tests.

The cheapest gates are the ones you probably already have: types and linters. Ours run TypeScript in strict mode and a linter for every language we use, on every PR. The custom checks come on top of them.

Here are a few of those custom ones, to give you a picture of what I mean. We would probably never have added checks like these before AI took over. But today you can one-shot each of them with a single prompt, so it's easy to add one whenever you need it.

### Use the components we have

We have a design system with its own components, and the agent has to use them. Not create his own buttons. So CI fails any PR with a raw button: use Button or IconButton. The same goes for inputs and tooltips. The Button also owns its height and radius, so the agent cannot restyle it where he uses it. And colors are tokens, so a hex color anywhere outside one file fails too.

### Money goes through one place

Every write to the tables that hold our customers' credits goes through one module. CI fails any PR that writes there from anywhere else.

We added the gate the same day as the module, before anything went wrong. You don't need an incident to add a gate. If a mistake would be expensive, make it impossible from the start.

### One helper, one place

In October I asked the agent to clean up our small helpers: formatting dates, the right timezone, formatting names and so on. They were duplicated a lot: hundreds of copies, each written slightly differently, and some of the differences were bugs. One wrote local time into a column that should be UTC.

Some of the copies were written by people, some by agents. And the agent copies whatever is there. So first every helper got one place in the codebase, every copy was replaced with it, and the helpers nobody used were deleted. Then we added a gate, so the copies don't grow back. A new private copy fails CI unless it is listed with a reason.

That is the order from the first section. Fix the codebase first, then add the gate.

### You don't have to fix everything first

Some of our gates started on code that already broke the rule in many places. So the gate starts with a list of every old violation. Those pass, anything new fails, and the list can only get shorter. The codebase never gets worse, and the old violations get fixed over time.

## Tests

We have automated tests only for billing. Honestly, I am not a big fan of them at our stage. Everything else the agent tests the same way you would, once, before he opens the PR. I wrote about that in the previous article.

For some teams this might not be optimal, and they might want to cover way more. That is fine. But tests have a maintenance cost. Every test you add is one more thing to keep up to date with every change. That got cheaper with AI too, but it's still not zero.

And right now, no automated test can beat human QA. Agents are not yet good at recognizing bad UX, or whether a feature makes sense the way it's implemented.

## Prose: CLAUDE.md, AGENTS.md and skills

When your agent keeps doing something you don't like, and it's hard to enforce with any of the above, then you mention it in your CLAUDE.md, AGENTS.md or skills.

## Human review: The PR template

In the previous article I mentioned the PR template. The goal is to unify all PRs, so they are easier to review once you get used to the structure.

Ours goes like this. The problem: why this PR exists. The solution: what changed, for someone who has not opened the diff. Verification: how the agent tested it, with before and after screenshots, and possibly a video. And operator steps, when someone has to do something by hand on deploy, like setting a new environment variable.

To make the solution easier to understand, I recommend the [show-me skill](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md). It helps the agent visualize and explain the change: a diagram, a sketch of the call tree or a diff of the file structure instead of a wall of text.

Right now I am also experimenting with an impact rating. The agent rates three things low, medium or high. Blast radius: how much of the app the change can break, from one screen to the whole platform. Revertibility: how easy it is to undo, from a simple revert to a database change that needs a manual fix. Production impact: what it changes for users, and whether it touches money, login or deploys. The PR gets the worst of the three.

The agent doesn't start from zero. A script reads the changed files and sets the lowest level each axis can get. Change a file that handles money, and production impact is high, whatever the agent thinks. The agent can raise a level, never lower it. And he has to back every level with evidence, not adjectives.

The goal of a PR description is to answer all the questions the reviewer might have, before he has them. So don't copy ours. Think about what you read first when you open a PR, and put that at the top.

## Next: how to write your CLAUDE.md or AGENTS.md

Prose is for what the agent cannot learn from the code and no script can check for him. How to write it is the topic of the next article. Not ours to copy, but how to think about what belongs in it and what does not.

Which mistake does your agent keep repeating?

---

Discuss: X https://x.com/st3pan3k/status/2120124846109528084 · LinkedIn https://www.linkedin.com/pulse/make-wrong-code-impossible-how-we-set-up-our-codebase-martin-%C5%A1t%C4%9Bp%C3%A1nek-9y31f
Follow Martin Štěpánek: X https://x.com/st3pan3k · LinkedIn https://www.linkedin.com/in/martin-st3pan3k
