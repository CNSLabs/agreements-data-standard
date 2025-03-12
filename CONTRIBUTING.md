# Grant Agreement Protocol

## IP PR Guidelines

An IP (Improvement Proposal) is a proposed change to the protocol. In order to be accepted, currently the protocol team votes on the over approval.

IP currently have two statuses:
* DRAFT - a proposal that is not yet ready for review
* PROPOSED - a proposal that is ready for review
* ACCEPTED - a proposal that has been accepted and integrated into the protocol

IP state PR requirements:
* non-existent -> DRAFT: a simple markdown file in the `definition/improvement-proposals` directory
* DRAFT -> PROPOSED: a PR that includes the following:
  * the IP markdown file
  * modified [PROTOCOL.MD](PROTOCOL.md) to include the new IP
  * modified [templates](definition/templates/grant-agreement.json) to showcase exact changes to the JSON template
  * modified [templates](definition/templates/grant-agreement.md) to showcase the changes to the prose
* PROPOSED -> ACCEPTED: a vote by the protocol team to accept the proposal and merge the PROPOSED PR





