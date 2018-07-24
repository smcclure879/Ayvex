


"""
What we're doing here is sending specific request messages asking for groups of data from the HV battery subsystem.
As best we can tell all of the requests from the scan-tool regarding the HV battery are sent on the 0x79b CAN ID with responses on 0x7bb. All packets are 8 bytes although sometimes not all 8 are utilized.
We've found 6 different groups of data...
Group 1 has 6 lines of data (precision SOC, Ah Capacity and perhaps battery State of Health %)
Group 2 has 29 lines of data and contains all 96 of the cell voltages.
Group 3 has 5 lines and contains the Vmin and Vmax as well as a few other things we haven't figured out yet.
Group 4 has 3 lines of data and contains the 4 pack temperatures.
Group 5 has 11 lines and again, not sure what it is yet..
Group 6 (discovered by Lincomatic) has 4 lines of data and contains the status of the resistive cell balancing shunts.
"""


"""
In order to read a group of data, first send the initial request command on ID 0x79b:
0x02 0x21 group 0xff 0xff 0xff 0xff 0xff (those last 5 bytes can be 0xff or 0x00, doesn't seem to matter, and yeah I tried group 0 and 6.. didn't see anything)

For example to request pack temperatures you'd start with
0x79b: 0x02 0x21 0x04 0 0 0 0 0

Which returns something like:
0x7bb: 0x10 0x10 0x61 0x04 0x01 0xfb 0x15 0x01
"""

group1=0x01
retpack=send( 0x79b, [ 0x02, 0x21, group1,   0xff, 0xff, 0xff, 0xff, 0xff ] )
print(retpack)
exit()







"""
The first byte is an index (incremented on subsequent lines), the 2nd byte is a sort of group size, the 3rd byte is 0x61 (responding to the 0x21) and the 4th byte is the group number. The actual data starts on the 5th byte.
In this example the first temperature is a 3 byte value (16bit raw A/D and 8bit temp) 0x01fb 0x15 meaning 21 degrees C with the raw 10 bit A/D NTC thermistor value 0x1fb or 507 decimal. The start of the 2nd temperature is the last byte of the message.

To ask for additional lines of data, they must be requested within about a second of the initial request. In my software I ask for the 2nd line immediately after receiving the first and then ask for subsequent lines every 16ms or so.
The request additional lines command is
0x79b: 0x30 0x01 0x00 0xff 0xff 0xff 0xff 0xff

All subsequent lines will have an index in the first byte with 2 as the MS nibble and the lower nibble (4 bits) as the index.. The remaining 7 bytes are all data.
Such as:
0x7bb: 0x21 0xf8 0x15 0x02 0x06 0x13 0x02 0x0d
(ie the other 2/3rds of temp2, all of temp3 and the first 2/3rds of temp4)

In order to receive the last line, another 0x30 0x01 0x00 request is sent and for this example the response looks like:
0x7bb: 0x22 0x13 0x13 0x00 0xff 0xff 0xff 0xff
(giving the last byte of temp4.. not sure what if anything the extra 0x13 and 0x00 mean... maybe some check-sum)

On a side note, I'm trying to recreate the thermistor circuit so that we might be able to get more precise temperatures calculated from the raw A/D value as compared to the car's 1 degree C reading. As temps go up, the A/D value goes down and it's nonlinear.. It's kinda noisy though so better than 1/4 degree C isn't likely.

In larger groups (cell voltages in group 2) the index byte continues 0x23, 0x24, 0x25 etc wrapping from 0x2f back to 0x20.

The cell voltages in Group 2 start with the 5th byte in the first line (just like the temps) with the first two cell voltages then subsequent lines contain another 3 and a half cell voltages on each.

example:
0x7bb: 10 C6 61 02 0F D8 0F D4
0x7bb: 21 0F D0 0F D9 0F D0 0F
0x7bb: 22 CC 0F D3 0F D0 0F D0
etc..

If you ask for more than the above mentioned lines for each group (including the first line from the initial request), you won't get a response.

<edit> If the car is charging and is OFF (and has been OFF for more than one minute) then initiating a group data request may cause a small clicking noise near the steering column for every new group data request if spaced more than 1 second apart. Most likely this is some controller that is normally asleep during charge that is woken up upon CAN data queries then goes back to sleep after a second or so. Just to be on the safe side, probably not a good idea to sample in such a way as to possibly wear our the relay.. ie between 1 second and probably a few minutes. I would guess it's not a big deal if you were only sampling every few minutes. This is only an issue when the car is off but charging.
I've tried sampling group 3 (which has the Vmin and Vmax) at 4Hz (intermediate lines at 16ms) with no trouble. I tried intermediate line requests at 8ms and that seemed to work but there were a few glitches. Even at 16ms I'm not 100% certain I'm getting ALL the data ALL the time, but mostly it's working great. These 0x7xx messages are the lowest priority on the bus but it's still probably not a good idea to overload it..

We're still trying to decode additional data in group 3 as well as groups 1 and 5, so it'll be fun to see what kind of data the other folks out there are getting on their systems...

<edit>In Group 1, the "Real SOC" (ie the EV-CAN 0x55b message) is represented in much higher resolution..
It's the last 3 bytes on the 5th line.. for example while the EV-CAN 0x55b message reports 79.8%, Group 1 line 5 reports 79.8202 (0x0c2dfa)
The Ah capacity of the battery is on bytes 3, 4 and 5 of the 6th (last) line. For example 0x0A4754 is 67.3620Ah
The battery health (as a percentage) is on bytes 2 and 3 of the 5th (2nd to last) line. For example 0x25a4 is 96.36%

<edit>As mentioned above (and later in this thread), Group 4 has the 4 pack temps as a 16bit raw A/D value and an 8 bit value as the car's reading in degrees C.. Pasted here is the data I've collected thusfar relating raw thermistor A/D values to the car's reported temps. If anyone has data to extend this above 31 or below

-1 degrees C finishes at 730 (Kudos to Sean W. for catching this one!)
-0 degrees C starts at 729
+0 degrees C starts at 720 (LeafDD with original SW is accurate down to here!)
1 degrees C starts at 710
2 degrees C starts at 700
3 degrees C starts at 690
4 degrees C starts at 680
5 degrees C starts at 671 (?!?!) strange, double confirmed. P.S. Thanks Steve S for these single digit confirmations.
6 degrees C starts at 660
7 degrees C starts at 650
8 degrees C starts at 640
9 degrees C starts at 630
10 degrees starts at 620
11 degrees starts at 609
12 degrees starts at 599
13 degrees starts at 589
14 degrees starts at 579
15 degrees starts at 569
16 degrees starts at 558
17 degrees starts at 548
18 degrees starts at 537
19 degrees starts at 527
20 degrees starts at 517
21 degrees starts at 507
22 degrees starts at 497
23 degrees starts at 487
24 degrees starts at 477
25 degrees starts at 467
26 degrees starts at 457
27 degrees starts at 447
28 degrees starts at 438
29 degrees starts at 428
30 degrees starts at 419
31 degrees starts at 410
32 degrees starts at 401
33 degrees starts at 392
34 degrees starts at 383
35 degrees starts at 374
36 degrees starts at 365
37 degrees starts at 357
38 degrees starts at 348
39 degrees starts at 340
40 "" 332 ?
41 "" 324 ?
42 degrees starts at 316
43 degrees starts at 309
44 "" 302 ?
45 "" 295 ?

Group 6 has the cell balancing info as 24 bytes, the lower 4 bits on each byte reflecting the shunts on the resistive loads used to balance the pack.
The shunt for cell #1 is in the first byte bit 3
The shunt for cell #2 is in the first byte bit 2
The shunt for cell #3 is in the first byte bit 1
The shunt for cell #4 is in the first byte bit 0
The shunt for cell #5 is in the 2nd byte bit 3
The shunt for cell #6 is in the 2nd byte bit 2
etc


I'll continue to update this first post as we find more info.
Last edited by GregH on Tue Jan 14, 2014 11:06 am, edited 17 times in total.
'17 blue Volt Premier w/ACC
'12 SL black Leaf
'11 SL blue Leaf
RAV4-EV 2002-2005
Gen1 & Gen2 EV1 1997-2003
PV 2.4Kw, 10kWh lithium battery SCE TOU-DA

User avatarTickTock
Posts: 1701
Joined: Sat Jun 04, 2011 10:30 pm
Delivery Date: 31 May 2011
Leaf Number: 3626
Location: Queen Creek, Arizona
Contact: Website
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 5:04 pm

Way to go, Greg! Finally, the holy grail!  :-) This will answer a lot of questions. I added your findings to the consolidated Leaf canbus doc (bottom of the EVCan tab).
User avatargarygid
Gold Member
Posts: 12436
Joined: Wed Apr 21, 2010 8:10 am
Delivery Date: 29 Mar 2011
Leaf Number: 000855
Location: Laguna Hills, Orange Co, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 5:50 pm

Great work, and thanks a bunch for sharing.

What interface are you using to query the EV bus?

Have you experimented with making any Requests on
the CAR-CAN bus or the AV-CAN bus?

Now, I have a good reason to perfect some code for the
AVR-CAN (and Mbed) to send Requests, and actively
receive messages (the Replies).

To get it done, the CAN interface chip needs to be in
Transmit-Enabled mode both for sending the requests,
AND for actively Receiving messages. However, if one
wants to continue passively listening to other messages
(not being the active "recipient") one needs to be very careful
to only write the ACK bit to the "response" messages.

Again, thanks for sharing.

My first goal will be to add the 4 Battery Pack temperatures
to the GID-Meter, probably only done once a minute, or so.
See SOC/GID-Meter and CAN-Do Info
2011 LEAF, sold in 2015
2010 Prius, 2014 silver Tesla S
Nissan EVSE, mod to 240/120v 16A
PU: SDG&E
Solar PV: 33 x 225W -> 7 kW max AC
To Sell: X-treme 5000Li EV motorcycle
User avatargarygid
Gold Member
Posts: 12436
Joined: Wed Apr 21, 2010 8:10 am
Delivery Date: 29 Mar 2011
Leaf Number: 000855
Location: Laguna Hills, Orange Co, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 5:55 pm

GregH wrote:
So with a little help from TickTock and a friend at Nissan, we've been able to replicate some of the specific CAN messages used by the technician's scan-tool to read data from the Leaf battery management system.
First of course I should say that SENDING CAN messages to your Leaf (as compared to passively listening) could cause problems although most of the harmful writable data is usually protected with additional check-sums.
Anyway.. Proceed at your own risk..

What we're doing here is sending specific request messages asking for groups of data from the HV battery subsystem.
As best we can tell all of the requests from the scan-tool regarding the HV battery are sent on the 0x79b CAN ID with responses on 0x7bb. All packets are 8 bytes although sometimes not all 8 are utilized.
We've found 5 different groups of data...
Group 1 has 6 lines of data (not sure what it is yet)
Group 2 has 29 lines of data and contains all 96 of the cell voltages.
Group 3 has 5 lines and contains the Vmin and Vmax as well as a few other things we haven't figured out yet.
Group 4 has 3 lines of data and contains the 4 pack temperatures.
Group 5 has 11 lines and again, not sure what it is yet..

In order to read a group of data, first send the initial request command on ID 0x79b:
0x02 0x21 group 0xff 0xff 0xff 0xff 0xff (those last 5 bytes can be 0xff or 0x00, doesn't seem to matter, and yeah I tried group 0 and 6.. didn't see anything)

For example to request pack temperatures you'd start with
0x79b: 0x02 0x21 0x04 0 0 0 0 0

Which returns something like:
0x7bb: 0x10 0x10 0x61 0x04 0x01 0xfb 0x15 0x01

The first byte is an index (incremented on subsequent lines), the 2nd byte is a sort of group size, the 3rd byte is 0x61 (responding to the 0x21) and the 4th byte is the group number. The actual data starts on the 5th byte.
In this example the first temperature is a 3 byte value (16bit raw A/D and 8bit temp) 0x01fb 0x15 meaning 21 degrees C with the raw 10 bit A/D NTC thermistor value 0x1fb or 507 decimal. The start of the 2nd temperature is the last byte of the message.

To ask for additional lines of data, they must be requested within about a second of the initial request. In my software I ask for the 2nd line immediately after receiving the first and then ask for subsequent lines every 16ms or so.
The request additional lines command is
0x79b: 0x30 0x01 0x00 0xff 0xff 0xff 0xff 0xff

All subsequent lines will have an index in the first byte with 2 as the MS nibble and the lower nibble (4 bits) as the index.. The remaining 7 bytes are all data.
Such as:
0x7bb: 0x21 0xf8 0x15 0x02 0x06 0x13 0x02 0x0d
(ie the other 2/3rds of temp2, all of temp3 and the first 2/3rds of temp4)

In order to receive the last line, another 0x30 0x01 0x00 request is sent and for this example the response looks like:
0x7bb: 0x22 0x13 0x13 0x00 0xff 0xff 0xff 0xff
(giving the last byte of temp4.. not sure what if anything the extra 0x13 and 0x00 mean... maybe some check-sum)

On a side note, I'm trying to recreate the thermistor circuit so that we might be able to get more precise temperatures calculated from the raw A/D value as compared to the car's 1 degree C reading. As temps go up, the A/D value goes down and it's nonlinear.. It's kinda noisy though so better than 1/4 degree C isn't likely.

In larger groups (cell voltages in group 2) the index byte continues 0x23, 0x24, 0x25 etc wrapping from 0x2f back to 0x20.

The cell voltages in Group 2 start with the 5th byte in the first line (just like the temps) with the first two cell voltages then subsequent lines contain another 3 and a half cell voltages on each.

example:
0x7bb: 10 C6 61 02 0F D8 0F D4
0x7bb: 21 0F D0 0F D9 0F D0 0F
0x7bb: 22 CC 0F D3 0F D0 0F D0
etc..

If you ask for more than the above mentioned lines for each group (including the first line from the initial request), you won't get a response.

In early experiments (before figuring out how to ask for successive lines) I was toggling between asking for the first line of group 2 and the first line of group 3 at a 1250ms interval (about the max it would let me) and I could hear an odd clicking sound coming from the OBD2 port. Now that we're getting all the data, the clicking seems to have gone away as well as the 1.1 second max sample rate.
I've tried sampling group 3 (which has the Vmin and Vmax) at 4Hz (intermediate lines at 16ms) with no trouble. I tried intermediate line requests at 8ms and that seemed to work but there were a few glitches. Even at 16ms I'm not 100% certain I'm getting ALL the data ALL the time, but mostly it's working great. These 0x7xx messages are the lowest priority on the bus but it's still probably not a good idea to overload it..

We're still trying to decode additional data in group 3 as well as groups 1 and 5, so it'll be fun to see what kind of data the other folks out there are getting on their systems...


A real step forward for the rest of us, Thanks again.

CAUTION: Be very careful when experimenting with writing to the car,
and never do your first experiments while driving, it is just too dangerous.
See SOC/GID-Meter and CAN-Do Info
2011 LEAF, sold in 2015
2010 Prius, 2014 silver Tesla S
Nissan EVSE, mod to 240/120v 16A
PU: SDG&E
Solar PV: 33 x 225W -> 7 kW max AC
To Sell: X-treme 5000Li EV motorcycle
GregH
Posts: 860
Joined: Fri Jul 01, 2011 4:16 pm
Delivery Date: 13 Jun 2011
Leaf Number: 26967
Location: Irvine, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 6:17 pm

garygid wrote:
Great work, and thanks a bunch for sharing.

What interface are you using to query the EV bus?

Have you experimented with making any Requests on
the CAR-CAN bus or the AV-CAN bus?

Now, I have a good reason to perfect some code for the
AVR-CAN (and Mbed) to send Requests, and actively
receive messages (the Replies).

To get it done, the CAN interface chip needs to be in
Transmit-Enabled mode both for sending the requests,
AND for actively Receiving messages. However, if one
wants to continue passively listening to other messages
(not being the active "recipient") one needs to be very careful
to only write the ACK bit to the "response" messages.

Again, thanks for sharing.

My first goal will be to add the 4 Battery Pack temperatures
to the GID-Meter, probably only done once a minute, or so.


Very cool.. I'll try to stop by the meeting tomorrow morning after my run.
I used Peak's PCAN dongle and PCAN-View initially to experiment with the bus, but once I'd locked down the major info I moved to a little 8 bit MCU board I made some years back with a single CAN port and 128x64 OLED graphics display. I've only got a few left and am not looking to manufacture or sell anything... There's plenty of other nice hardware already floating around this place!
I can demonstrate my setup tomorrow.
I have not played with the AV or CAR CAN buses although I have break-outs for them on my OBD2 cables.
I did see messages to/from another controller on EV-CAN (0x79d, responses on 0x7bd) but haven't played with it.

I look forward to seeing the temperature responses from you and others.. So far I've seen:
21 degrees 499-505 raw
20 degrees 509-517 raw
19 degrees 518-527 raw
18 degrees 528-536 raw
17 degrees 538-547 raw
.. but for example I don't know if 537 would come down as 17 or 18 degrees.. so I'm looking to fill in this table with more data..
'17 blue Volt Premier w/ACC
'12 SL black Leaf
'11 SL blue Leaf
RAV4-EV 2002-2005
Gen1 & Gen2 EV1 1997-2003
PV 2.4Kw, 10kWh lithium battery SCE TOU-DA
User avatarTonyWilliams
Posts: 10074
Joined: Sat Feb 19, 2011 1:48 am
Location: San Diego
Contact: Website
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 6:26 pm

TickTock wrote:
Way to go, Greg! Finally, the holy grail!  :-) This will answer a lot of questions. I added your findings to the consolidated Leaf canbus doc (bottom of the EVCan tab).


Yes, pack temperature is huge!!! Great work. Now, we need to break the code for Tesla / Toyota Rav4 (drooling).
User avatarTickTock
Posts: 1701
Joined: Sat Jun 04, 2011 10:30 pm
Delivery Date: 31 May 2011
Leaf Number: 3626
Location: Queen Creek, Arizona
Contact: Website
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 8:37 pm

Thanks again Greg! Just finished coding it up. Here's the money-shot.
You do not have the required permissions to view the files attached to this post.
GregH
Posts: 860
Joined: Fri Jul 01, 2011 4:16 pm
Delivery Date: 13 Jun 2011
Leaf Number: 26967
Location: Irvine, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Fri Feb 22, 2013 10:35 pm

TickTock wrote:
Thanks again Greg! Just finished coding it up. Here's the money-shot.

Sweet!! That's gonna be awesome.

P.S.170 Gids @ 75.4%?? Ouch.. How many capacity bars are you at?
'17 blue Volt Premier w/ACC
'12 SL black Leaf
'11 SL blue Leaf
RAV4-EV 2002-2005
Gen1 & Gen2 EV1 1997-2003
PV 2.4Kw, 10kWh lithium battery SCE TOU-DA
User avatargarygid
Gold Member
Posts: 12436
Joined: Wed Apr 21, 2010 8:10 am
Delivery Date: 29 Mar 2011
Leaf Number: 000855
Location: Laguna Hills, Orange Co, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Sat Feb 23, 2013 7:43 am

The 170/281 = 60.5% GIDs
I usually display %GIDs to make the comparison
with the "Real SOC" percentage easier.
See SOC/GID-Meter and CAN-Do Info
2011 LEAF, sold in 2015
2010 Prius, 2014 silver Tesla S
Nissan EVSE, mod to 240/120v 16A
PU: SDG&E
Solar PV: 33 x 225W -> 7 kW max AC
To Sell: X-treme 5000Li EV motorcycle
GregH
Posts: 860
Joined: Fri Jul 01, 2011 4:16 pm
Delivery Date: 13 Jun 2011
Leaf Number: 26967
Location: Irvine, CA
Re: Active EV-CAN sampling: cell voltages, pack temperatures
Quote
Sat Feb 23, 2013 4:12 pm

garygid wrote:
The 170/281 = 60.5% GIDs
I usually display %GIDs to make the comparison
with the "Real SOC" percentage easier.


When I was looking at vehicles on the dealer lot I was trying to figure out an equation that could give a consistent battery health number.. Ideally something on the order of Gids/SOC although I saw a small drift in this equation at various states of charge.. What I found worked better (and have been using since) is Gids/(SOC-3)... This will return about 3.0 for a new car (a car capably of 276-281 Gids). Among the various vehicles I measured this morning at the meeting we saw a range from 2.55-2.85. I didn't have the CAN SOC data back with Joulee3 but if memory serves I was getting about 243 Gids on a full charge.. If we assume 95% is full that would be 243/92=2.64. Last night in the new car I had 281 @ 95.4% so 281/92.4=3.041. On a full charge two weeks ago I saw 278 Gids @ 94.5% so 278/91.5 = 3.038.. About the same. If you choose to use % Gids (which is a little confusing imho) then it's off by a factor 2.81.
'17 blue Volt Premier w/ACC
'12 SL black Leaf
'11 SL blue Leaf
RAV4-EV 2002-2005
Gen1 & Gen2 EV1 1997-2003
PV 2.4Kw, 10kWh lithium battery SCE TOU-DA


"""