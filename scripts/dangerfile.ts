import { warn, danger } from "danger";

const pullRequestDescription = danger.github.pr.body;

function checkSummary() {
  if (pullRequestDescription.length < 65)
    return warn(
      "Make sure to right an adequate summary of the changes you have made."
    );
  if (pullRequestDescription.length < 15)
    return fail("Please write a summary of the changes you've made.");
}

checkSummary();
