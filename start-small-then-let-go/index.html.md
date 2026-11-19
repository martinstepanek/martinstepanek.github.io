# Start small, then let go. How to learn to trust AI agents

By Martin Štěpánek (https://martinstepanek.github.io/), published 6 November 2026. Web version: https://martinstepanek.github.io/start-small-then-let-go/

The code does not have to be perfect. It never was.

It took me a while to accept that. A bit more than a year ago, I was one of those resistant engineers who refused to use AI for coding. When I finally started, it took me about a month on Opus 4.5 to get to a level that was the same as before.

In my previous article, [AI writes 100% of our code. Here is what happened.](https://martinstepanek.github.io/ai-writes-100-percent-of-our-code/), I showed how we use AI to accelerate our development and what impact it had on our codebase and platform. What I did not show is how we achieved it. That is too much for one article, so I will cover it over several, starting with the basics: how to start trusting your agents to write code.

This article is for two groups of people. Those who still write some code by hand, and those who let AI write all of it, but still watch the thread as it works and actively steer it. There is one section for each.

One assumption for both: you work on feature branches and merge them into a protected dev branch through pull requests. And the agent is sandboxed or limited, so he cannot touch anything he could break, like production. Then he can do whatever he wants on his branch without you approving every step. The goal is to give him as much autonomy as possible without him being able to do any harm.

## Still writing code by hand

### Model selection

At the time of writing, I would recommend most people get an Anthropic subscription and use Opus 5.5 on high effort for most tasks. For simple tasks you can use lower effort, and of course it's OK to use GPT models as well. This is just my general recommendation. Opus 5.5 is an almost Fable-level model, while being way cheaper and more economical with your subscription usage. Why I think Fable is so good is in [my post about which models changed how I work](https://www.linkedin.com/feed/update/urn:li:activity:7524076989373247488/).

### Aligning intent

Your job is not to tell the agent exactly what to do. Your job is to explain the problem you are trying to solve and give the agent all the data he needs. Today's models will probably solve it better than you (no offense).

So when you are starting, make sure the agent understands your problem. Explain your problem and your goal. Let the agent create a plan first. The reason for the plan is to make sure the agent thinks the problem through and gets all the data before he starts working. If you just tell him to build it or fix it, he will start working and then, in the middle of the work, realize he did not think of something.

Claude Code no longer starts in plan mode, and the team behind it is thinking about removing it altogether. Models today do not need a special mode. You can just tell them to plan before they start working.

### Don't try to one-shot at the start

A lot of developers immediately try to one-shot a solution, get bad results and give up with "AI generates slop". Or they try to debug and polish it, which takes them even more time than writing it themselves, and conclude the same.

To be able to one-shot solutions, or almost one-shot them, you have to understand how to prompt which model (different models need different prompting styles) and what AI is good at and what not, and you have to have a system set up for review and verification.

What worked for me is to start small. I told the agent to implement a simple method. From there multiple methods, classes, integrations and whole features, slowly increasing complexity and trying to find out where the boundaries are, what works and what doesn't. It takes time and patience. Unfortunately there is no better recipe than that.

### Controlling git

At the start, just review the changes and commit them yourself. The moment you are satisfied with the changes, let the agent commit for you! I promise he will write way better commit messages and descriptions than you. And while you are at it, let him also create the pull request for you. You might want to create a PR template the agent follows, but more about that in the next article.

## Still watching the thread

You are not useful when you are watching AI work. You want to get to the point where you kick off the agent, let him work and don't hear from him until he is done. And when he is done, you just check the PR and merge it. Ideally, you maximize the chance that you actually want to merge the PR. That the PR is right. And while he is working, you are free to do other things, for example kick off another task in parallel.

In 40 days I [shipped 1,200 PRs](https://www.linkedin.com/feed/update/urn:li:activity:7520075876655427584/) and had to intervene in only 11.5% of them (steer the agent or cancel the PR). I would not be able to do that if I was watching the threads.

Don't forget that PRs and code are cheap. If you don't like one, you can always tell the agent to rebuild it or throw it away.

### Code review

Before you get to code review, let the agent review the code for you and fix the issues. And no, he probably won't do it by himself without you telling him. So when you instruct the agent to do something, just append to the end of the prompt: "when you create the PR, do a code review and fix the issues". Simple as that. No skills, and I promise you, the output will be significantly better.

If you have multiple subscriptions, I recommend telling one agent to use a different model to review his output. It has a different view of the code, the same way different people have different views. Tell Opus to use GPT Sol 6.1 to review his PR.

### Testing and verification

The more the agent is able to test his work, the better his output will be and the more you can trust him. Frontier models already try to verify their work, but ideally you want to tell them explicitly to do it, and how.

And no, it's not about writing automated tests. Of course you can. But the agent can just test it once, the same way you would. Try telling your agent to e2e test your feature. If it's backend, he can call all the endpoints and verify all the cases. If it's frontend, he can click through the UI and test it as a normal person would.

Want to be sure the agent tested it right? Tell him to include screenshots or even videos in the PR. Today's models are more than able to do that. Every time I open a PR with visual changes, it contains before and after screenshots of the app.

### Letting go

And this is probably the hardest part. The code does not have to be perfect. It never was. Just because the agent does not write code the way you do does not mean it's not worth merging. Maybe he writes more verbose code than the average human. Why care?

Code always has to fulfill two requirements. It has to do what's expected of it, and it has to be readable. The moment you look at the code and realize you don't understand it the way you want to, fine, refactor it. But until then, you don't have to care about every line break, constant or method name. I wrote more about this in June: [Code quality just does not matter that much anymore](https://www.linkedin.com/feed/update/urn:li:activity:7475840395428519936/).

## Next: the codebase

Everything above works in any codebase. But how far you can let go depends on the codebase too. What the agent can learn from it, what it checks for him, and how many agents can work in it at once without getting in each other's way. In the next article: how we set up ours.

What still makes you watch the thread?

---

Discuss: X https://x.com/st3pan3k/status/2118723212863271302 · LinkedIn https://www.linkedin.com/pulse/start-small-let-go-how-learn-trust-ai-agents-martin-%C5%A1t%C4%9Bp%C3%A1nek-x5oyf
Follow Martin Štěpánek: X https://x.com/st3pan3k · LinkedIn https://www.linkedin.com/in/martin-st3pan3k
