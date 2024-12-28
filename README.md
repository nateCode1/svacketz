# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

# Seeding
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
Match A: 1v4
Match B: 2v3
```

This process can be extended for any 2*n participant brackets.

The following pseudocode describes an algorithmic way to make these assignments:
```
AssignMatches(Participant[] allParticipants, int numParticipants):
  // Constraint: numParticipants % 2 == 0
  numMatches = numParticipants / 2

  Match[numMatches] allMatches;
  for i = 0 to numMatches:
    allMatches[i].Assign(allParticipants[i], allParticipants[numParticipants - i - 1])
```

### Case 2: n to 1 
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
```
AssignMatches(Participant[] allParticipants, int numParticipants, int participantsPerMatch):
  // Constraint: numParticipants % participantsPerMatch == 0

  numMatches = numParticipants / participantsPerMatch
  Match[numMatches] allMatches;
  for i = 0 to numMatches:
    for j = 0 to participantsPerMatch:
      if j == 0:
        allMatches[i].Assign(allParticipants[i])
      else:
        allMatches[i].Assign(allParticipants[numParticipants - i - 1 - (j-1) * numMatches])
``` 
### Case 3: n to m
This is very similar to Case 2, but we take from the first m buckets in increasing order.

To illustrate this we will look at an example of 5 to 2, with participants {1,2,3,4,5,6,7,8,9,10}. Following our previous example we will first split into n (10) buckets:
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
```
AssignMatches(Participant[] allParticipants, int numParticipants, int participantsPerMatch, int winnersPerMatch):
  // Constraint: numParticipants % participantsPerMatch == 0

  numMatches = numParticipants / participantsPerMatch
  Match[numMatches] allMatches;
  for i = 0 to numMatches:
    for j = 0 to participantsPerMatch:
      if j == 0:
        allMatches[i].Assign(allParticipants[i])
      else:
        allMatches[i].Assign(allParticipants[numParticipants - i - 1 - (j-1) * numMatches])
```
## Single Round Non-Ideal Seeding
This covers the case of seeding a single round of matches with n participants and m winners, for any arbitrary number of participants.

...TODO