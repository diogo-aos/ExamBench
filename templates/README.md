This folder is for holding ODT templates that can be used in ExamBench.
They should have specific placeholders that are filled, e.g.

```txt
Test - Version {version}

Questions
{#mcq}
Q {question_number} [{question_score} val., -{question_penalty} pen.].  {question_text}
{#options}
    {option_number}. {option_text}
{/options}
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
{/mcq}
```

In this case, the `{#mcq} {/mcq}` block will be replicated
for the individual questions and the placeholders replaced by the different fields.

