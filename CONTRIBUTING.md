# Grant Agreement Protocol

## IP PR Guidelines

An IP (Improvement Proposal) is a proposed change to the protocol. In order to be fully integrated into the protocol, currently the protocol team votes on the over approval, and the following process must be followed.

IP currently have two statuses:
* `IDEA` - budding concept
* `DRAFT` - a proposal that is not yet ready for review
* `PROPOSED` - a proposal that is ready for review
* `ACCEPTED` - a proposal that has been accepted and integrated into the protocol

IP state PR requirements:
* `IDEA`: a PR to the [README.md](README.me) file proposing it to be added to the list of IPs that might become drafter
* `IDEA -> DRAFT`: a simple markdown file in the [definition](definition) directory
* `DRAFT -> PROPOSED`: a PR that includes the following:
  * the IP markdown file
  * modified [PROTOCOL.md](PROTOCOL.md) to include the new IP
  * modified [templates json file](definition/templates/grant-agreement.json) to showcase exact changes to the JSON template
  * modified [templates description file](definition/templates/grant-agreement.md) to showcase the changes to the prose
* `PROPOSED -> ACCEPTED`: a vote by the protocol team to accept the proposal and merge the PROPOSED PR





