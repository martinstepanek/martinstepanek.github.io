# Onboard your agent like a new developer. How we wrote our CLAUDE.md

By Martin Štěpánek (https://martinstepanek.github.io/), published 18 November 2026. Web version: https://martinstepanek.github.io/onboard-your-agent-like-a-new-developer/

Don't copy someone else's CLAUDE.md. It was written for their codebase and their team. Your codebase looks different and your team works differently, so your agent has to work differently too.

In my previous article, [Make the wrong code impossible. How we set up our codebase for agents](https://martinstepanek.github.io/make-the-wrong-code-impossible/), I wrote about where to fix the things your agent keeps doing wrong. First in the codebase, then with deterministic checks like CI, and only after that in prose: CLAUDE.md or skills. This article is about the prose.

Think of the agent as a new developer on your team. At the start he doesn't understand anything about how you work. He needs to be onboarded, so he understands your intent and behaves the way the rest of the team expects. That is what CLAUDE.md is for: aligning the agent with you and your team. And with an agent, every session is his first day.

I won't give you a template. I will show you what is in ours and why, so you can think about what should be in yours. And also what should never be there.

## What should not be there

First, never use Claude Code's /init command, which creates a CLAUDE.md for you. By design, /init is wrong, because it creates it from the codebase. That means it writes down everything the agent is already able to read by himself. But CLAUDE.md should contain only the things he is not able to read or infer from the codebase. So I highly recommend writing it by hand and not letting AI write it.

For the same reason, it should never contain a description of the codebase. No documentation or path explanations (a lot of people write something like "src/ - code, docs/ - documentation", explaining what is where). This kind of documentation becomes obsolete very quickly, so it might even cause harm. And if the agent can't find his way around the code, fix the code.

And it should not contain anything that can be checked deterministically by a script. For example, we use React Compiler, so there is no need for manual useMemo or useCallback. That rule had been in our CLAUDE.md since April, but the agent kept adding them anyway. So we added a linter rule that fails on every new one, and removed the line from CLAUDE.md. Now the agent can't get it wrong.

## Your values

Write down what you value. These are decisions you made as a team, and the agent can't see them in the code.

For example, we don't really care about backward compatibility, since most of our traffic comes from MCP and not from the API. And the agents using our MCP have no problem with breaking changes. They just pick up the newest tools. But agents tend to write special shims so they don't introduce a breaking change, even when it's not worth it. That makes the code way more complex.

What we value is simplicity. The simpler the code is, the easier it is to read, update and remove. And the fewer errors it has. So our CLAUDE.md says that on our public API and MCP, simplicity beats backward compatibility. Delete the old behavior instead of keeping shims and dual code paths for it.

The second one: we value deploys that don't interrupt work. We deploy often, so our services restart often. For the user, a restart has to be a non-event. A generation that was running has to finish after the restart. It can't fail, hang or charge the user twice. So every feature has to be designed with that in mind.

To find your values, look at the PRs where the agent made a decision you would have made differently. Usually there is a reason why you would do it differently, and that reason is what you write down.

## Your language

Every product has its own language, and it can't always be understood from the codebase.

We have surfaces: places where our users can use our features. Studio, flows, our public API, MCP and our in-app agent. We use these words in our specs and prompts all the time, like "ship it on every surface". So our CLAUDE.md has a short definition of each one, together with a rule: every new feature ships on all surfaces, and they all share one core, so it behaves the same everywhere.

A lot of engineers now embrace domain-driven design (DDD) even more than in the past, since it gives the agent a clear separation and a common vocabulary to communicate with. DDD has its own downsides, so we are still looking into it and haven't applied it yet.

Write down the words from your specs, issues and prompts that the agent can't learn from the code.

## Behavior

Tell the agent how to behave: how to work with you, how to approach things, when to be autonomous and when to stop for your input. These are some examples we have in our CLAUDE.md.

### Which model does what

We use different models for different work, and our CLAUDE.md says which one is for what. At the time of writing this article, Opus 5.5 is the default for almost everything: implementation, plans, specs and investigations. We use Fable 5.2 only when we ask for it.

Every piece of work gets two independent reviews before it's handed over: one from a fresh Opus 5.5 that did not write it, and one from GPT Sol 6.1. We don't trust Sol to ship code as much as Opus. But Sol is incredible at reviews, since it's very diligent. It also helps as a second thinker on hard problems, because it brings its own view.

In the first article of this series, [Start small, then let go. How to learn to trust AI agents](https://martinstepanek.github.io/start-small-then-let-go/), I recommended telling the agent to use a different model to review his PR. With this in your CLAUDE.md, you don't have to tell him every time.

### Investigations and questions are read-only

Models tend to jump to implementation, even when you don't want them to. You just ask why something is broken, and the agent is already fixing it.

That's why the most useful lines in our CLAUDE.md are probably these: investigations are strictly read-only. The agent reads the data and reports what he found, but he changes nothing unless we tell him to.

What he can look at, like errors, logs, metrics and a copy of our production database, is listed in a separate investigate skill.

## Keep it up to date

Your CLAUDE.md is not something you write once.

Update it at least with every new frontier model. Different models behave differently. They have their own quirks, strengths and weaknesses. Our model section has changed with every release since July. Back then, the models were so different that we had a table with a score for every model's cost, intelligence and taste. Now Opus 5.5 is extremely good at almost everything and GPT models are great for reviews, so a few simple lines are enough.

It also needs to be checked against your previous conversations and updated based on them. Every time you have to step in and correct the agent, there is a reason for it. You don't have to look for it by hand. Just ask the agent: "go through my last sessions, find every time I had to correct you, and tell me why".

If something keeps coming back, it's a candidate for CLAUDE.md. But first try to fix it in the code or with a check, as I wrote in the previous article. Only if that's not possible does it go into CLAUDE.md. The agent reads the whole file in every session, and every line competes for his attention with all the others, so try to keep it short and simple.

## Write your own

So when you are writing yours, ask yourself three questions. What do you value when you build your software? Which words are specific to your product and don't clearly map to your code? And when did the agent behave in a way you didn't want, and how would you like him to behave instead?

Next article: scaling. What happens when you run tens of agents at once, and why the bottleneck moves from writing code to everything around it.

What is the best line you ever put in your CLAUDE.md?

---

Discuss: X https://x.com/st3pan3k/status/2123076372260118597 · LinkedIn https://www.linkedin.com/pulse/onboard-your-agent-like-new-developer-how-we-wrote-our-%C5%A1t%C4%9Bp%C3%A1nek-sy6gf
Follow Martin Štěpánek: X https://x.com/st3pan3k · LinkedIn https://www.linkedin.com/in/martin-st3pan3k
