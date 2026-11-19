# AI writes 100% of our code. Here is what happened.

By Martin Štěpánek (https://martinstepanek.github.io/), published 13 October 2026. Web version: https://martinstepanek.github.io/ai-writes-100-percent-of-our-code/

I joined Maxfusion AI as CTO in May 2026. Now AI writes all of our code without exception. We ship features that take others weeks or even months in days, while drastically lowering technical debt, cutting down on errors and making the platform more stable than ever. And every month is better than the one before.

## 8x the code with 2 developers

In September alone we launched [Research Lab](https://www.linkedin.com/posts/today-we-are-launching-research-lab-search-ugcPost-7510680109138350080-fY5B/), [Radar](https://www.linkedin.com/posts/today-were-launching-radar-spy-on-your-ugcPost-7513194991951986689-gpQC/) and a full redesign of the platform's UI. On top of that 5 new tools, support for 7 new models, Brain with brand kits and an Asana integration, all of it on the web app, the flow canvas, the public API and MCP at once. Two engineers, one month. And it was not the first month like that.

On 2 July I posted that we built a [public REST API with 40+ endpoints from a product specification to a production release in 4 days](https://www.linkedin.com/posts/martin-st3pan3k_my-team-was-able-to-develop-a-public-rest-share-7478409359287439360-0xrs/). Most of it was done by one person in the first 2 days. The last 2 days were bug fixing and polishing. Authentication, two-layer rate limits, idempotency, async job delivery, interactive docs, an admin panel for API keys. Not vibe coded, peer reviewed, production ready. That API has 150 endpoints today.

The MCP server is generated from that API, so every endpoint we add becomes a tool an agent in Claude or ChatGPT can use. From spec to merged server took 5 working days. 90% of that went into frictionless interaction: tool interfaces, descriptions, MCP widgets. The code was the easy part. A week later we announced [MCP with 47 tools](https://www.linkedin.com/posts/martin-st3pan3k_mcp-with-47-tools-90-of-the-development-ugcPost-7480231925736022017-18ca/).

In August we fully [rebuilt our queue](https://www.linkedin.com/posts/introducing-zero-queue-time-is-money-waiting-ugcPost-7505176007776108544-s-Hy/) from the ground up in just 3 days. 99.8% of all generations now start in under 0.1 s, an edge over competitors where you have to either wait or pay extra for priority generations.

![Code lines changed per month, October 2025 to September 2026, with developer headcount](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/01-lines-monthly-1760.webp)

![Merged pull requests per month, April to September 2026, with developer headcount](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/02-prs-monthly-1760.webp)

In lines of code, September was 8x the monthly average of the 7 months before I joined, 16x per developer. 2,472 commits against 240 to 460 a month before May, 803 merged pull requests against 45 in April. Headcount went from 5 to 2 in July. Per-developer output has gone up every month since.

Lines of code are a bad metric. They say nothing about whether anyone wants what we built, and nothing about the state of the codebase. Both next.

## 9.9x paid usage

"More features do not make the product better." They do if you build in the right direction. Direction is measured in usage.

Paid generations in September were 9.9x January and about 5x April, the month before I joined. They grew every single month in between.

![Paid generations per month as a multiple of January 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/03-paid-generations-monthly-1760.webp)

The MCP from July did 38% of paid generations, almost as many as the web app at 39%. One third of everyone who paid for a generation used it at least once. MCP alone did 3.8x the paid generations of the whole product in January. ![Share of paid generations by where they were started, April to September 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/04-generation-surfaces-1760.webp)

A refund is issued when a paid generation fails, so if quality had slipped under that load, refunds would go up. They went the other way, from over 5% before May to 3.7% in September.

## 5x fewer errors per generation

![Production error events per week, July to September 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/05-error-events-weekly-1760.webp)

We connected Sentry at the end of June. There is no error data from before that, because there was no Sentry. The first weeks were ugly: about 2,000 error events a week in July, one week over 3,000. Nothing in there was new. Sentry just showed us the backlog. July was the month of fixing what the months before had left behind.

Then it dropped: an average of 652 a week in August and 777 in September. Single weeks still jump around, the last one of September hit 1,294. Paid generations more than doubled over the same months, so per generation production now throws more than 5x fewer errors than in July.

Bugs in new code went the same way. 7.1 per 10,000 lines of code changed in July, 9.4 in August, 1.9 in September. September changed almost 3x the code of August with 5x fewer bugs per line. 78% of all code bugs since July are already resolved.

![New code bugs per 10,000 lines of code changed per week, July to September 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/06-code-bugs-weekly-1760.webp)

## 5x less technical debt

"Fast code is technical debt you pay later." We pay it now, and it got cheap. When [I wrote in June that code quality does not matter that much anymore](https://www.linkedin.com/posts/martin-st3pan3k_code-quality-just-does-not-matter-that-much-share-7475840393893367808-T41J/), half the thread read it as "we are abandoning quality". I was talking about the ROI of managing technical debt. The price of fixing, rewriting and deleting code dropped, so we do it all the time.

![Minutes of technical debt per 1,000 lines of code, SonarQube, July to September 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/07-tech-debt-1760.webp)

![Share of duplicated lines, SonarQube, July to September 2026](https://martinstepanek.github.io/images/ai-writes-100-percent-of-our-code/08-duplicated-lines-1760.webp)

Around the same time we connected Sentry, we also set up SonarQube. The first scan: 593 hours of debt, 140 minutes per 1,000 lines of code, 15.9% duplicated lines. Same as with the errors, we measured it for the first time and started paying it down. By the end of September it was 28 minutes per 1,000 lines, 2.8% duplicated and about 170 hours in total, while the code grew 46%. 120 pull requests in this period deleted code and nothing else, net 80,000 lines removed. If something is too messy it is easier to rewrite it whole than to patch it forever.

Of course SonarQube cannot tell you everything about the state of the codebase and code quality.

One number went the other way. Cyclomatic complexity per 1,000 lines went up 10%, from 118 to 130. More endpoints, more tools, more branches. We care way more about cognitive complexity, SonarQube's measure of how hard code is to read, and that did not go up: flat per 1,000 lines, from 103 to 100, and 13% lower per function, from 2.5 to 2.2.

## Best month on every row

Most code, most pull requests, highest paid usage, lowest refund share, fewest bugs per line, least debt per line, lowest duplication. And the biggest feature month we have ever had. If AI produced slop, September would be the worst month in this article. It is the best one on every row.

The job of a startup is to build something people pay for before the money runs out. Speed and direction are everything. The productivity gain from AI grows every month, and September was the biggest step so far. Getting there meant rebuilding the whole development cycle, the tooling, the company and everything around it. How we did that is the second article, out at the end of October.

What number would change your mind, if not these?

---

Discuss: X https://x.com/st3pan3k/status/2110357035766157644 · LinkedIn https://www.linkedin.com/pulse/ai-writes-100-our-code-here-what-happened-martin-%C5%A1t%C4%9Bp%C3%A1nek-kjngf/
Follow Martin Štěpánek: X https://x.com/st3pan3k · LinkedIn https://www.linkedin.com/in/martin-st3pan3k
