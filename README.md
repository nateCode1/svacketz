# Creating a Single Elimination Bracket
## Single Round Ideal Seeding
This covers the case of seeding a single round of participants, where the number of participants is evenly divisible by the participants in a match. This does not cover seeding of subsequent rounds.
### Case 1: 2 to 1 
In the case of 1v1 single winner matches (2 participants to 1 winner), seeding is trivial. Suppose we have participants {1,2,3,4} whose seed is the same as their number. We would have 2 matches, match A and match B.

We would map the first and last seed to the same match
```
1 -> A
2
3
4 -> A
```

Then map the second and second last seed to the same match
```
1
2 -> B
3 -> B
4
```

Resulting in the final assignments:
```
Match A: 1,4
Match B: 2,3
```

This process can be extended for any 2*n participant brackets.

The following pseudocode describes an algorithmic way to make these assignments:
<details>
  <summary>Code Breakdown</summary>

  This code is written as pseudocode, meaning it isn't in any particular language. The intent is clarity and broad readability.

  The code assumes that allParticipants is sorted according to seed (increasing). This means the top seed is at index 0 in allParticipants.

  Participant and Match are both assumed to be classes, their implementation is omitted because it's not the focus here. Similarily the details of the Assign function aren't included, as they aren't criticial to understand whats going on. Minimal requirements for each class are listed below:
  - Participant must have some identifying information for the participant, and optionally their seed.
  - Match must contain a list of participants, and later on will require the ability to point to other matches. It must implement the Assign method, which takes a Participant as an argument, and adds the participant to its own list of participants for this particular match.

  % is the modulo operator, `a % b` returns the remainder of `a / b`.

  The comment indicating the constraint could be written as an assertion were this actually implemented, but later on we will remove this constraint.

  The line `Match[numMatches] allMatches` is meant to represent the allocation/initialization of a list of numMatches length, in most languages this would be more involved, but for our purposes all we need to know is that the list exists, and how long it is.
</details>

```c++
AssignIdealSingleRoundMatches(Participant[] allParticipants, int numParticipants):
  // Constraint: numParticipants % 2 == 0
  numMatches = numParticipants / 2

  Match[numMatches] allMatches
  for i = 0 to numMatches:
    allMatches[i].assign(allParticipants[i])
    allMatches[i].assign(allParticipants[numParticipants - i - 1])

  return allMatches
```

#### Case 2: n to 1 
Lets now suppose each match has n participants. This introduces a number of new ways to decide the seeding of a new match. We'll take the case of 3 to 1, and look at participants {1,2,3,4,5,6}. Seed 1 and 2 should be in different matches, and seed 1 should have the "easier match of the two".


Depending on how strongly we wish to favour the top seed, the following could work in one of a few ways. The way that provides the most "fair" match-ups can be conceptualized by splitting all the participants into n "buckets", where n is the number of participants in a match.

For the 1-6 example this would look like:
```
1,2
---
3,4
---
5,6
```
1-12 example: `1,2,3,4 | 5,6,7,8 | 9,10,11,12`

Then, assign to matches in increasing order for the first bucket, and decreasing order for every other bucket. For the 1-6 example this produces the following:

```
1 -> A
2 -> B
---
3 -> B
4 -> A
---
5 -> B
6 -> A
```

This gives the final assignment of:
```
Match A: 1v4v6
Match B: 2v3v5
```
Or in the 1-12 example:
```
Match A: 1,8,12
Match B: 2,7,11
Match C: 3,6,10
Match D: 4,5,9
```

The following pseudocode describes an algorithmic way to make these assignments:
```c++
AssignIdealSingleRoundMatches(Participant[] allParticipants, int numParticipants, int participantsPerMatch):
  // Constraint: numParticipants % participantsPerMatch == 0

  numMatches = numParticipants / participantsPerMatch
  Match[numMatches] allMatches
  for i = 0 to numMatches:
    for j = 0 to participantsPerMatch:
      if j == 0:
        allMatches[i].assign(allParticipants[i])
      else:
        allMatches[nm - 1 - i].assign(allParticipants[i + j * nm])
  
  return allMatches
``` 
### Case 3: n to m
This is very similar to Case 2, but we take from the first m buckets in increasing order.

To illustrate this we will look at an example of 5 to 2, with participants {1,2,3,4,5,6,7,8,9,10}. Following our previous example we will first split into n (5) buckets:
```
1
2
---
3
4
---
5
6
---
7
8
---
9
10
```


Then for the first m (2) buckets we assign in increasing order, and for the remaining buckets assign in decreasing order. We will again have matches A and B.
```
Increasing order:
1 -> A
2 -> B
---
Increasing order:
3 -> A
4 -> B
---
Decreasing order:
5 -> B
6 -> A
---
Decreasing order:
7 -> B
8 -> A
---
Decreasing order:
9 -> B
10 -> A
```

Which results in the final assignments of:
```
Match A: 1,3,6,8,10
Match B: 2,4,5,7,9
```


A slight update to the previous algorithm can make these new assignments:
```c++
AssignIdealSingleRoundMatches(Participant[] allParticipants, int numParticipants, int participantsPerMatch, int winnersPerMatch):
  // Constraint: numParticipants % participantsPerMatch == 0

  numMatches = numParticipants / participantsPerMatch
  Match[numMatches] allMatches
  for i = 0 to numMatches:
    for j = 0 to participantsPerMatch:
      if j < winnersPerMatch:
        allMatches[i].assign(allParticipants[i + j * nm])
      else:
        allMatches[nm - 1 - i].assign(allParticipants[i + j * nm])
  
  return allMatches
```
## Single Round Non-Ideal Seeding
This covers the case of seeding a single round of matches with n participants and m winners, for any arbitrary number of participants.

Most of the procedures for single round non-ideal seeding match those for the ideal case. For our previous methods to apply, we need a number of participants that is divisible by the number of participants per match (denoted as n).

To accomidate this, some matches will be missing one or more participants. In the case of a bracket with 2 participants per match this is commonly referred to as a BYE round. Going forward BYE will refer to a dummy participant which doesn't actually participant, but is a placeholder for within the bracket.

Lets look at a 2 participant per match example to begin. Suppose we have participants {1,2,3,4,5}. For our methods to work we will need the number of participants to be divisible by 2, which 5 is not. This constraint can be formalized as:

```number of participants % participants per match == 0```

Where % is the modulo operator.

To satisfy this constraint we must add additional placeholders (BYEs) until this constraint is satisfied. In this case we'd add one. To find how many placeholders to add for any given bracket we can use the following formula:

```participants per match - (number of participants % participants per match)```

Once we have added our placeholders, the process is exactly the same as before.

We can update our algorithm from before to implement this update:
```c++
AssignSingleRoundMatches(Participant[] allParticipants, int numParticipants, int participantsPerMatch, int winnersPerMatch):
  int numPlaceholders = participantsPerMatch - (numParticipants % participantsPerMatch)
  allParticipants = allParticipants.addPlaceholderParticipants(numPlaceholders)

  numMatches = numParticipants / participantsPerMatch
  Match[numMatches] allMatches
  for i = 0 to numMatches:
    for j = 0 to participantsPerMatch:
      if j < winnersPerMatch:
        allMatches[i].assign(allParticipants[i + j * nm])
      else:
        allMatches[nm - 1 - i].assign(allParticipants[i + j * nm])
```
## Seeding Subsequent Rounds
### Case 1: Participants Per Match is Divisible by Winners Per Match
*For brevity participants per patch and winners per match will hitherto be referred to as PPM and WPM respectively.*

#### Case 1.1: Single Winner Per Match
When each match only has a single winner, the winner of the match should be given the top seed present in the match when going into the next round. Meaning if 1 and 8 are paired together, the winner would always be seeded as 1 going into the next round. This can extend to >2 PPM; if a match was 2v7v11, the winner would be given the 2 seed in the next round.
<details>
  <summary>What happens if participants keep their seed?</summary>
  This is a valid way to run a bracket, however, it means that its impossible to pre-generate all the matches & connections between them. This is because which participants are in which match depends on which seeds are present in the round, which depends on the results of the previous round.
  
  Take the bracket below as an example. Assume the winners from the first round are 1,2,3,4. This means the next round would have 1v4, and 2v3.

  However, if we assume the winners are 8,2,3,4 the next round would be 2v8, 3v4. This means that depens on who wins, 2 and 3 either go to different matches, or the same match, which means no definite bracket can be drawn ahead of time.

  This solution would also only make sense in the case where seeding is strongly defined, as it will provide even greater advantage to participants with a better seed, which may be undesirable if seeding is poorly defined or perhaps even random.
</details>
<br>
In the diagram below the rounds are given their conventional names for readability, as well as being numbered according to the top seed present in the match (i.e. the top seed in Semifinal 2, is seed 2).

```mermaid
graph LR
  A1["Quaterfinal 1<br><sub>1st Seed<br>8th Seed</sub>"] -->
   Q1["Semifinal 1<br><sub>Winner of Quaterfinal 1<br>Winner of Quarterfinal 4</sub>"]
  A2["Quaterfinal 4<br><sub>4th Seed<br>5th Seed</sub>"] --> Q1

  A3["Quaterfinal 2<br><sub>2nd Seed<br>7th Seed</sub>"] -->
   Q2["Semifinal 2<br><sub>Winner of Quarterfinal 2<br>Winner of Quarterfinal 3</sub>"]
  A4["Quaterfinal 3<br><sub>3rd Seed<br>6th Seed</sub>"] --> Q2

  Q1 --> F1["Final<br><sub>Winner of Semifinal 1<br>Winner of Semifinal 2</sub>"]
  Q2 --> F1
```

Notice how if we look at the semifinal round, it exactly resembles the structure of a 2 PPM, 1 WPM bracket with only 4 participants. The matches are 1v4 and 2v3, same as they would be were it instead the first round.

This points to a recursive approach. This approach could be described as seeding a single round, getting the seeds of all the winners (which we set as the highest seed present in the match), then seeding a round using the winners' seeds. This can be repeated until there is only a single match in a round, at which point the winner of that match is the winner of the bracket.

#### Case 1.2: Multiple Winners Per Match
*Note that this case still only covers when `PPM % WPM == 0`*.

Multiple winners presents a unique issue depending on how seeding is handled. There are two valid options, which will be showcased in the context of 4 PPM, 2 WPM matches.
1. All winners inherit the top seed of the match. As an example, if round 1 had 1v5v12v16, both winners would be assigned 1 seed for round 2.
1. Winners inherit their seed according to placement. Using the same example of 1v5v12v16, going into the next round 1st place would get 1 seed, and 2nd place would get 5 seed.

Neither of these is a perfect solution.

Solution 1 preserves an easy to visualize bracket, where all winners from a single match move on to the same subsequent match, allowing the connections between matches to be easily drawn. See a simplified bracket diagram below, where only the seeds of each participant is shown within each match:
```mermaid
graph LR
  A1["1,5,12,16"] -->
   Q1["1,1,4,4"]
  A2["4,8,9,13"] --> Q1

  A3["2,6,11,15"] -->
   Q2["2,2,3,3"]
  A4["3,7,10,14"] --> Q2

  Q1 --> F1["1,1,2,2"]
  Q2 --> F1
```
Unfortunately this leads to seeding mostly breaking down after the first round, and it gets worse with larger brackets.

Solution 2 preserves the integrity of seeding in rounds beyond the first, however, it results in winners from a single match being in different matches in subsequent rounds, thus making it difficult to visualize the connecitons. An example of this solution is shown below, in the same style as the solution 1 bracket:
```mermaid
graph LR
  A1["1,5,12,16"] -->
   Q1["1,3,6,8"]
  A2["4,8,9,13"] --> Q1
  A1 -.-> Q2
  A2 -.-> Q2

  A3["2,6,11,15"] -->
   Q2["2,4,5,7"]
  A4["3,7,10,14"] --> Q2

  A3 -.-> Q1
  A4 -.-> Q1

  Q1 --> F1["1,2,3,4"]
  Q2 --> F1
```
Another flaw in this approach is that it requires that each match not only output winners, but that it output winners in order from "most winner" to "least winner". If that information is not available, it would be possible to use the seeding to determine which winners should be awareded a higher seed in subsequent rounds.

It bears mention that winners from a single match not being placed together in subsequent matches could be viewed as a positive depending on the application.

Either of these solutions is valid, however when looking at [Case 2](#case-2-participants-per-match-not-divisible-by-winners-per-match), solution 2 is prefered, as in that case it is impossible to have all winners from a match end up in the same match in the next round.

<details>
  <summary>What about having a single winner?</summary>
  In Case 1.1 this was trivial, as the final match of the bracket would produce a single winner, which could then be considered the winner of the entire bracket. In this case there are a few options, the best one will depend on context.

  - Run the final match and take the multiple winners as the winners of the bracket
  - Run the final match and take whichever winner comes 1st in the final match as the winner of the bracket
  - Have the final match only produce a single winner
  - Create another match after the "final" match that takes all the winners from the "final" match and only produces a single error.
</details>

### Case 2: Participants Per Match NOT Divisible by Winners Per Match

If `PPM % WPM != 0` then it is impossible to have all winners from a single match go to the same match in subsequent rounds. Take the example of 5 PPM, 3 WPM. Every round 1 match will contribute 3 participants to round 2. This means that to create one match in round 2, you will need 1 and 2/3rds round 1 matches. This implies that even disregarding all seeding, it is not possible to keep winners from 1st round matches in the same matches for round 2.

Given that this is the case, it makes the most sense to make use of solution 2 proposed in Case 1.2.

### Additional Constraint

Our previous constraint was to ensure we have the right quantity participants to fill a single round, and it stated that `Number of Participants % PPM == 0`. However, when seeding multiple rounds, we must additionally ensure that each subsequent round will have a valid number of participants. Given one round has `X` matches, the next round will have `X * WPM` matches.

We will begin with the `PPM % WPM == 0` case. Knowing that our final round will have `1 * PPM` participants (as there is only one match, the finals), we can work backwards. The round before last will need to produce `1 * PPM` winners, meaning we know `X * WPM = PPM`. Solving for `X` gives us `X = PPM / WPM`. Extending this logic tells us that each round will have a number of matches equal to `PPM / WPM` multiplied by the number of matches in the subsequent round. This is an exponential relationship where our base is `PPM / WPM`.

This means to ensure that every single round has a valid number of participants, we need the number of participants to be equal to `PPM / WPM` raised to some power. This can be expressed more mathematically as:

$\log_{\mathrm{PPM/WPM}}{(Num Participants)} \: \% \: 1 \: == 0$

*Note that specifying `some quantity % 1 == 0` is the same as specifying that it is a whole number.*

For a given number of participants `P`, and a PPM to WPM ratio of `PPM / WPM = B` the number of placeholders to be added can be given as:

$B^{\left(\log_{B}\left(P\right)+1-\operatorname{mod}\left(\log_{B}\left(P\right),1\right)\right)} - P
$

Unfortunately, as with before when `PPM % WPM != 0` there are additional considerations. The result is that it is impossible to only have 1st round BYEs. With the previous method, placeholder contestants (BYEs) would only appear in the first round. However, in this case, it is unavoidalbe to have BYEs in subsequent rounds. To illustrate this we will take a 3 PPM, 2 WPM bracket with 15 total participants.

```
1st Round: 15 Participants => 5 Matches => 10 Winners
2nd Round: 10 Participants => 3 & 1/3 Matches => INVALID
```

This is just an example, but it should provide some intuition on the inherent issue at hand, a more rigourous explination is viewable in [Appendix 1](#appendix-1-why-a-3-to-2-bracket-always-requires-non-1st-round-byes).

No perfect solution is available, but the best solution is to add placeholder participants as required in each round. This means following the procedure described in the [Single Round Non-Ideal Seeding](#single-round-non-ideal-seeding) section before seeding each round.

### Pseudocode
// TODO: Multiple rounds pseudocode

# Double Elimination

# TODO:
- Rationalize why m to n case is the way it is
- Intro explaining what seeding is, and how everything is about tradeoffs in how important it should be
- Figure out more items for todo list

# Appendicies
## Appendix 1: Why a 3 to 2 Bracket Always Requires Non 1st Round BYEs
Assuming a bracket of `P` participants with 3 PPM (Participants per Match) and 2 WPM (Winners per Match) it is impossible to create a bracket without BYEs in rounds that aren't the first round, provided `P > 3`. The reason why relates to prime factorization and the relationship between participants in one round and the next.

In a single round every 3 participants produce 2 winners (which move on to the next round). This means that each round will have `2/3 * Previous Round Participants`. This means that for each round after the first, the prime factorization of the number of participants in that round must contain a 2.

