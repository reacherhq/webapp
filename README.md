## Quick Start

Whether you’re new to email verifications or seasoned in all things SMTP, this is where you’ll find out how to develop applications with Reacher. We offer simple code snippets for several popular programming languages.

The Reacher API is organized around [REST](https://en.wikipedia.org/wiki/Representational_state_transfer). Our API has predictable resource-oriented URLs, accepts [form-encoded](<https://en.wikipedia.org/wiki/POST_(HTTP)#Use_for_submitting_web_forms>) request bodies, returns [JSON-encoded](www.json.org) responses, and uses standard HTTP response codes, authentication, and verbs.

The documentation on this page focuses on the technical side of Reacher. If you have non-technical question, be sure to also check our [FAQ](https://www.notion.so/reacherhq/Reacher-FAQ-389d6f51a53749f29d914239613c64eb).

### Working with Reacher's API

The first step is to fetch your unique API Auth Token. You can do so in your [accounts page](https://reacher.email/account). Copy the token inside your clipboard.

The next step is to make a REST API request to the reacher servers. There's only one endpoint for now: check an email. Scroll down to see the [endpoint's specifications](#operation/post-check-email), as well as code snippets using cURL, Node.js, Python and Go.
